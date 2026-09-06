import {
  createTask,
  completeTask,
  listTasks,
  deleteTask,
  listPendingTasks
} from './services/task.service.js';
import { delay } from './utils/delay.js';
import { getAppName } from './utils/env.js';

const showTasks = (taskList = listTasks()): void => {
  const rows = taskList.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt.toLocaleString()
  }));
  console.table(rows);
};

const main = async (): Promise<void> => {
  console.log(`\n${getAppName()}`);
  console.log('Iniciando aplicación...');
  await delay(300);

  console.log('\nTareas iniciales:');
  showTasks();

  const newTask = createTask('Construir mi primer servicio');
  console.log(`Tarea creada con id ${newTask.id}.`);

  completeTask(newTask.id);
  console.log(`Tarea ${newTask.id} completada.`);

  console.log('\nTareas pendientes:');
  showTasks(listPendingTasks());

  deleteTask(1);
  console.log('Tarea 1 eliminada correctamente.');

  console.log('\nEstado final de tareas:');
  showTasks();

  // Prueba de error controlado al eliminar id inexistente
  try {
    deleteTask(999);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido.';
    console.error(`Error controlado: ${message}`);
  }
};

main().catch((error: unknown) => {
  console.error('Error no controlado:', error);
  process.exitCode = 1;
});
