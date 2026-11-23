import { useEffect, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { AuthPanel } from './components/AuthPanel';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskSummary } from './components/TaskSummary';
import type {
  AuthCredentials,
  AuthMode,
  User,
} from './models/auth.interface';
import type { Task } from './models/task.interface';
import type { TaskFilter, TaskSort } from './models/task-view.types';
import {
  ApiRequestError,
  completeTask,
  createTask,
  deleteTask,
  getCurrentUser,
  getTasks,
  loginAccount,
  registerAccount,
  updateTask,
} from './services/api.service';
import type { TaskListQuery, TaskListResult } from './services/api.service';

const SESSION_KEY = 'task-manager.access-token';
const PAGE_SIZE = 10;

interface TaskSummaryCounts {
  total: number;
  pending: number;
  completed: number;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado.';
}

function getQuery(
  page: number,
  status: TaskFilter,
  search: string,
  sortBy: TaskSort,
  limit: number,
): TaskListQuery {
  return {
    page,
    limit,
    sortBy,
    ...(status === 'all' ? {} : { status }),
    ...(search ? { search } : {}),
  };
}

export default function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem(SESSION_KEY) || '',
  );
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(
    () => !sessionStorage.getItem(SESSION_KEY),
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummaryCounts>({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSort>('updated-desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<TaskListResult['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!token || user) return;

    let active = true;

    getCurrentUser(token)
      .then(({ data }) => {
        if (active) {
          setIsLoading(true);
          setUser(data.user);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiRequestError && error.status === 401) {
          sessionStorage.removeItem(SESSION_KEY);
          setToken('');
          setAuthError('Tu sesión venció. Inicia sesión de nuevo.');
        } else {
          setAuthError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) setIsAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, [token, user]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!token || !user) return;

    let active = true;

    const pageQuery = getQuery(
      page,
      filter,
      debouncedQuery,
      sortBy,
      PAGE_SIZE,
    );
    const summaryQuery: TaskListQuery = {
      page: 1,
      limit: 1,
      sortBy: 'updated-desc',
    };

    Promise.all([
      getTasks(token, pageQuery),
      getTasks(token, summaryQuery),
      getTasks(token, { ...summaryQuery, status: 'pending' }),
      getTasks(token, { ...summaryQuery, status: 'completed' }),
    ])
      .then(([taskPage, allTasks, pendingTasks, completedTasks]) => {
        if (!active) return;
        setTasks(taskPage.data);
        setPagination(taskPage.meta);
        setSummary({
          total: allTasks.meta.total,
          pending: pendingTasks.meta.total,
          completed: completedTasks.meta.total,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiRequestError && error.status === 401) {
          sessionStorage.removeItem(SESSION_KEY);
          setToken('');
          setUser(null);
          setAuthError('Tu sesión venció. Inicia sesión de nuevo.');
          return;
        }
        setApiError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, user, page, filter, debouncedQuery, sortBy, refreshKey]);

  async function handleAuthenticate(
    mode: AuthMode,
    credentials: AuthCredentials,
  ): Promise<void> {
    setIsAuthenticating(true);
    setIsLoading(true);
    setAuthError('');
    setApiError('');

    try {
      if (mode === 'register') {
        await registerAccount(credentials);
      }

      const result = await loginAccount(credentials);
      sessionStorage.setItem(SESSION_KEY, result.data.accessToken);
      setUser(result.data.user);
      setPage(1);
      setAuthError('');
      setIsAuthReady(true);
      setToken(result.data.accessToken);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleProtectedError(error: unknown): void {
    if (error instanceof ApiRequestError && error.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      setToken('');
      setUser(null);
      setAuthError('Tu sesión venció. Inicia sesión de nuevo.');
      return;
    }
    setApiError(getErrorMessage(error));
  }

  async function handleAddTask(title: string): Promise<void> {
    if (!token) return;
    setIsSaving(true);
    setApiError('');
    try {
      await createTask(token, title);
      setPage(1);
      setIsLoading(true);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      handleProtectedError(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function runTaskMutation(
    operation: () => Promise<unknown>,
  ): Promise<void> {
    if (!token || isSaving) return;
    setIsSaving(true);
    setApiError('');
    try {
      await operation();
      setIsLoading(true);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      handleProtectedError(error);
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleStatus(id: string): void {
    if (!token) return;
    const selectedTask = tasks.find((task) => task.id === id);
    if (!selectedTask) return;

    void runTaskMutation(() =>
      selectedTask.status === 'pending'
        ? completeTask(token, id)
        : updateTask(token, id, { status: 'pending' }),
    );
  }

  function handleEditTask(id: string, title: string): void {
    if (!token) return;
    void runTaskMutation(() => updateTask(token, id, { title }));
  }

  function handleDeleteTask(id: string): void {
    if (!token || user?.role !== 'admin') return;
    const selectedTask = tasks.find((task) => task.id === id);
    if (!selectedTask) return;

    const shouldDelete = window.confirm(
      `¿Eliminar la tarea "${selectedTask.title}"?`,
    );
    if (shouldDelete) {
      void runTaskMutation(() => deleteTask(token, id));
    }
  }

  function handleLogout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    setToken('');
    setUser(null);
    setTasks([]);
    setPagination(null);
    setApiError('');
    setAuthError('');
    setPage(1);
  }

  function handleClearCriteria(): void {
    setIsLoading(true);
    setApiError('');
    setQuery('');
    setDebouncedQuery('');
    setFilter('all');
    setSortBy('updated-desc');
    setPage(1);
  }

  const hasActiveCriteria =
    query.trim() !== '' || filter !== 'all' || sortBy !== 'updated-desc';
  const emptyMessage = hasActiveCriteria
    ? 'No hay tareas que coincidan con la búsqueda y el filtro.'
    : 'Utiliza el formulario para registrar una nueva actividad.';

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        {!isAuthReady ? (
          <section className="panel auth-loading" role="status">
            Validando sesión…
          </section>
        ) : !token || !user ? (
          <AuthPanel
            error={authError}
            isSubmitting={isAuthenticating}
            onClearError={() => setAuthError('')}
            onSubmit={handleAuthenticate}
          />
        ) : (
          <>
            <section className="session-bar" aria-label="Sesión activa">
              <p>
                Sesión iniciada como <strong>{user.name}</strong>
                {user.role === 'admin' && (
                  <span className="role-badge">Administrador</span>
                )}
              </p>
              <button type="button" className="session-logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </section>
            {apiError && (
              <p className="api-feedback" role="alert">
                {apiError}
              </p>
            )}
            <TaskForm onAddTask={handleAddTask} isSubmitting={isSaving} />
            <TaskFilters
              query={query}
              filter={filter}
              sortBy={sortBy}
              resultCount={tasks.length}
              onQueryChange={(value) => {
                setIsLoading(true);
                setApiError('');
                setQuery(value);
                setPage(1);
              }}
              onFilterChange={(value) => {
                setIsLoading(true);
                setApiError('');
                setFilter(value);
                setPage(1);
              }}
              onSortChange={(value) => {
                setIsLoading(true);
                setApiError('');
                setSortBy(value);
                setPage(1);
              }}
              onClear={handleClearCriteria}
            />
            <TaskSummary
              total={summary.total}
              pending={summary.pending}
              completed={summary.completed}
            />
            <TaskList
              tasks={tasks}
              canDelete={user.role === 'admin'}
              emptyMessage={emptyMessage}
              isBusy={isSaving}
              isLoading={isLoading}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
            {pagination && pagination.totalPages > 1 && (
              <nav className="task-pagination" aria-label="Paginación de tareas">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setApiError('');
                    setPage((current) => current - 1);
                  }}
                  disabled={!pagination.hasPreviousPage || isLoading}
                >
                  Anterior
                </button>
                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setApiError('');
                    setPage((current) => current + 1);
                  }}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Siguiente
                </button>
              </nav>
            )}
            {user.role !== 'admin' && (
              <p className="permission-note">
                Solo las cuentas administradoras pueden eliminar tareas.
              </p>
            )}
          </>
        )}
      </main>
      <footer className="app-footer">
        <div className="app-footer__content">
          <p>Administrador de tareas · Conectado a la API</p>
        </div>
      </footer>
    </div>
  );
}
