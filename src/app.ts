import express from 'express';
import { taskRouter } from './routes/task.routes.js';
import { errorHandler } from './middlewares/error-handler.js';

export const app = express();

app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/tasks', taskRouter);

app.use(errorHandler);
