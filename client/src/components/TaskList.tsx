import type { Task } from '../models/task.interface';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  canDelete: boolean;
  emptyMessage: string;
  isBusy: boolean;
  isLoading: boolean;
  onToggleStatus: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({
  tasks,
  canDelete,
  emptyMessage,
  isBusy,
  isLoading,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const resultLabel = tasks.length === 1 ? '1 tarea' : `${tasks.length} tareas`;

  return (
    <section className="panel" aria-labelledby="task-list-title">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Actividades</p>
          <h2 id="task-list-title">Tareas registradas</h2>
        </div>
        <span className="result-count">{resultLabel}</span>
      </div>
      {isLoading ? (
        <div className="empty-state" role="status">
          <h3>Cargando tareas</h3>
          <p>Consultando la lista del servidor.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>Sin resultados</h3>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="task-list" role="list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              canDelete={canDelete}
              isBusy={isBusy}
              onToggleStatus={onToggleStatus}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}