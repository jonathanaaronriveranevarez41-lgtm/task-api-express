import express from 'express';
import { healthRouter } from './routes/health.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());

// Registro de rutas
app.use('/health', healthRouter);
app.use('/api/tasks', taskRouter);

app.use(errorHandler);

export default app;
