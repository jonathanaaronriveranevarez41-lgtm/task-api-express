import express from 'express';
import { healthRouter } from './routes/health.routes.js';
import { taskRouter } from './routes/task.routes.js'; // 1. Importa tus rutas de tareas
import { requestContext } from './middlewares/request-context.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const app = express();

app.use(requestContext);
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/tasks', taskRouter); // 2. Monta el enrutador en la ruta base

app.use(notFound);
app.use(errorHandler);

export default app;
