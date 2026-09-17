import express from 'express';
import { taskRouter } from './routes/task.routes.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const app = express();

// 1. Asignar ID de rastreo a la petición
app.use(requestContext);

// 2. Parsear el cuerpo de las peticiones a JSON
app.use(express.json());

// 3. Ruta de verificación de estado (Healthcheck)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 4. Registrar las rutas del recurso /api/tasks
app.use('/api/tasks', taskRouter);

// 5. Middlewares de manejo de errores (SIEMPRE AL FINAL)
app.use(notFound);
app.use(errorHandler);
