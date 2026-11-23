const API_BASE_URL = String(window.TASK_API_URL || '')
  .trim()
  .replace(/\/+$/, '');
const SESSION_KEY = 'task-manager-access-token';

const state = {
  token: sessionStorage.getItem(SESSION_KEY),
  user: null,
  page: 1,
  meta: null,
  status: 'all',
  search: ''
};

const elements = {
  authView: document.querySelector('#auth-view'),
  dashboardView: document.querySelector('#dashboard-view'),
  authForm: document.querySelector('#auth-form'),
  authTitle: document.querySelector('#auth-title'),
  authSubtitle: document.querySelector('#auth-subtitle'),
  authMessage: document.querySelector('#auth-message'),
  authName: document.querySelector('#auth-name'),
  nameField: document.querySelector('#name-field'),
  authEmail: document.querySelector('#auth-email'),
  authPassword: document.querySelector('#auth-password'),
  passwordHint: document.querySelector('#password-hint'),
  authSubmit: document.querySelector('#auth-submit'),
  userSummary: document.querySelector('#user-summary'),
  logoutButton: document.querySelector('#logout-button'),
  createTaskForm: document.querySelector('#create-task-form'),
  newTaskTitle: document.querySelector('#new-task-title'),
  taskCount: document.querySelector('#task-count'),
  statusFilter: document.querySelector('#status-filter'),
  searchForm: document.querySelector('#search-form'),
  taskSearch: document.querySelector('#task-search'),
  dashboardMessage: document.querySelector('#dashboard-message'),
  taskList: document.querySelector('#task-list'),
  previousPage: document.querySelector('#previous-page'),
  nextPage: document.querySelector('#next-page'),
  pageSummary: document.querySelector('#page-summary')
};

let authMode = 'login';

function showNotice(element, message, kind = 'error') {
  element.textContent = message;
  element.className = `notice notice-${kind}`;
  element.hidden = !message;
}

function describeError(error) {
  if (error instanceof TypeError) {
    return 'No se pudo conectar con la API. Revisa que la API esté activa y que CORS_ORIGIN coincida con el dominio del cliente.';
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

async function request(path, options = {}) {
  const { method = 'GET', body, authenticated = true } = options;
  const headers = new Headers();

  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (authenticated && state.token) {
    headers.set('Authorization', `Bearer ${state.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let payload = null;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(
          `La API respondió con un formato inesperado (HTTP ${response.status}).`
        );
      }
    }
  }

  if (!response.ok) {
    const message =
      payload?.error?.message || `La API respondió con HTTP ${response.status}.`;

    if (response.status === 401 && authenticated && state.token) {
      clearSession();
      showAuthView('Tu sesión venció. Inicia sesión de nuevo.');
    }

    throw new Error(message);
  }

  return payload;
}

function clearSession() {
  state.token = null;
  state.user = null;
  sessionStorage.removeItem(SESSION_KEY);
}

function showAuthView(message = '') {
  elements.dashboardView.hidden = true;
  elements.authView.hidden = false;
  showNotice(elements.authMessage, message);
}

function showDashboard() {
  elements.authView.hidden = true;
  elements.dashboardView.hidden = false;
  elements.userSummary.textContent =
    `${state.user.name} · ${state.user.email}` +
    (state.user.role === 'admin' ? ' · Administrador' : '');
  loadTasks();
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === 'register';

  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    const selected = button.dataset.authMode === mode;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
  });

  elements.nameField.hidden = !registering;
  elements.authName.required = registering;
  elements.authPassword.minLength = registering ? 15 : 1;
  elements.authPassword.autocomplete = registering
    ? 'new-password'
    : 'current-password';
  elements.passwordHint.hidden = !registering;
  elements.authTitle.textContent = registering
    ? 'Crea tu cuenta'
    : 'Bienvenido de nuevo';
  elements.authSubtitle.textContent = registering
    ? 'Regístrate para empezar a organizar tus tareas.'
    : 'Ingresa tus datos para continuar con tus tareas.';
  elements.authSubmit.textContent = registering
    ? 'Crear cuenta'
    : 'Iniciar sesión';
  showNotice(elements.authMessage, '');
}

async function loadUser() {
  const result = await request('/api/auth/me');
  state.user = result.data.user;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  showNotice(elements.authMessage, '');
  elements.authSubmit.disabled = true;

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  try {
    if (authMode === 'register') {
      await request('/api/auth/register', {
        method: 'POST',
        authenticated: false,
        body: {
          name: elements.authName.value.trim(),
          email,
          password
        }
      });
    }

    const result = await request('/api/auth/login', {
      method: 'POST',
      authenticated: false,
      body: { email, password }
    });

    state.token = result.data.accessToken;
    state.user = result.data.user;
    sessionStorage.setItem(SESSION_KEY, state.token);
    elements.authForm.reset();
    state.page = 1;
    showDashboard();
  } catch (error) {
    showNotice(elements.authMessage, describeError(error));
  } finally {
    elements.authSubmit.disabled = false;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function makeButton(label, className, action, ariaLabel = label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', action);
  return button;
}

function renderTask(task) {
  const item = document.createElement('li');
  item.className = `task-item${task.status === 'completed' ? ' is-completed' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.status === 'completed';
  checkbox.className = 'task-checkbox';
  checkbox.setAttribute(
    'aria-label',
    `${checkbox.checked ? 'Reabrir' : 'Completar'}: ${task.title}`
  );
  checkbox.addEventListener('change', async () => {
    checkbox.disabled = true;
    try {
      if (checkbox.checked) {
        await request(`/api/tasks/${encodeURIComponent(task.id)}/complete`, {
          method: 'PATCH'
        });
      } else {
        await request(`/api/tasks/${encodeURIComponent(task.id)}`, {
          method: 'PATCH',
          body: { status: 'pending' }
        });
      }
      await loadTasks();
    } catch (error) {
      checkbox.checked = !checkbox.checked;
      checkbox.disabled = false;
      showNotice(elements.dashboardMessage, describeError(error));
    }
  });

  const content = document.createElement('div');
  content.className = 'task-content';
  const title = document.createElement('p');
  title.className = 'task-title';
  title.textContent = task.title;
  const date = document.createElement('time');
  date.className = 'task-date';
  date.dateTime = task.updatedAt;
  date.textContent = `Actualizada ${formatDate(task.updatedAt)}`;
  content.append(title, date);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.append(
    makeButton('Editar', 'button button-small button-quiet', () =>
      editTask(task)
    )
  );

  if (state.user.role === 'admin') {
    actions.append(
      makeButton('Eliminar', 'button button-small button-danger', () =>
        deleteTask(task)
      )
    );
  }

  item.append(checkbox, content, actions);
  return item;
}

function renderTasks(tasks) {
  elements.taskList.replaceChildren();

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    const title = document.createElement('strong');
    title.textContent = state.search
      ? 'No encontramos tareas con esa búsqueda.'
      : 'Todavía no hay tareas aquí.';
    const detail = document.createElement('span');
    detail.textContent = state.search
      ? 'Prueba con otras palabras o cambia el filtro.'
      : 'Agrega una tarea arriba para comenzar.';
    empty.append(title, detail);
    elements.taskList.append(empty);
  } else {
    elements.taskList.append(...tasks.map(renderTask));
  }

  const total = state.meta?.total ?? 0;
  elements.taskCount.textContent =
    `${total} ${total === 1 ? 'tarea' : 'tareas'}`;
  elements.pageSummary.textContent =
    `Página ${state.meta?.page ?? 1} de ${Math.max(state.meta?.totalPages ?? 0, 1)}`;
  elements.previousPage.disabled = !state.meta?.hasPreviousPage;
  elements.nextPage.disabled = !state.meta?.hasNextPage;
}

async function loadTasks() {
  showNotice(elements.dashboardMessage, '');
  elements.taskList.replaceChildren();
  const loading = document.createElement('li');
  loading.className = 'empty-state';
  loading.textContent = 'Cargando tareas…';
  elements.taskList.append(loading);

  const query = new URLSearchParams({
    page: String(state.page),
    limit: '50',
    sortBy: 'createdAt',
    order: 'desc'
  });
  if (state.status !== 'all') query.set('status', state.status);
  if (state.search) query.set('search', state.search);

  try {
    const result = await request(`/api/tasks?${query.toString()}`);
    state.meta = result.meta;
    renderTasks(result.data);
  } catch (error) {
    elements.taskList.replaceChildren();
    showNotice(elements.dashboardMessage, describeError(error));
  }
}

async function createTask(event) {
  event.preventDefault();
  const title = elements.newTaskTitle.value.trim();
  if (!title) return;

  const submitButton = elements.createTaskForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    await request('/api/tasks', { method: 'POST', body: { title } });
    elements.createTaskForm.reset();
    state.page = 1;
    await loadTasks();
  } catch (error) {
    showNotice(elements.dashboardMessage, describeError(error));
  } finally {
    submitButton.disabled = false;
  }
}

async function editTask(task) {
  const title = window.prompt('Actualiza el título de la tarea:', task.title);
  if (title === null) return;
  if (!title.trim()) {
    showNotice(elements.dashboardMessage, 'El título no puede estar vacío.');
    return;
  }

  try {
    await request(`/api/tasks/${encodeURIComponent(task.id)}`, {
      method: 'PATCH',
      body: { title: title.trim() }
    });
    await loadTasks();
  } catch (error) {
    showNotice(elements.dashboardMessage, describeError(error));
  }
}

async function deleteTask(task) {
  if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return;

  try {
    await request(`/api/tasks/${encodeURIComponent(task.id)}`, {
      method: 'DELETE'
    });
    await loadTasks();
  } catch (error) {
    showNotice(elements.dashboardMessage, describeError(error));
  }
}

function logout() {
  clearSession();
  state.page = 1;
  showAuthView('Sesión cerrada.');
}

document.querySelectorAll('[data-auth-mode]').forEach((button) => {
  button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
});

elements.authForm.addEventListener('submit', handleAuthSubmit);
elements.createTaskForm.addEventListener('submit', createTask);
elements.logoutButton.addEventListener('click', logout);

elements.statusFilter.addEventListener('change', () => {
  state.status = elements.statusFilter.value;
  state.page = 1;
  loadTasks();
});

elements.searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  state.search = elements.taskSearch.value.trim();
  state.page = 1;
  loadTasks();
});

elements.previousPage.addEventListener('click', () => {
  if (state.meta?.hasPreviousPage) {
    state.page -= 1;
    loadTasks();
  }
});

elements.nextPage.addEventListener('click', () => {
  if (state.meta?.hasNextPage) {
    state.page += 1;
    loadTasks();
  }
});

if (!API_BASE_URL) {
  showAuthView('Falta configurar la URL de la API para este cliente.');
} else if (state.token) {
  loadUser()
    .then(showDashboard)
    .catch((error) => {
      if (state.token) clearSession();
      showAuthView(describeError(error));
    });
} else {
  showAuthView();
}
