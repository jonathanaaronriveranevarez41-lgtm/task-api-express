import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  getTask,
  getTasks,
  patchTaskComplete,
  patchTaskStatus,
  postTask,
  removeTask
} from '../controllers/task.controller.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateTaskTitle } from '../middlewares/validate-task-title.middleware.js';
import { AppError } from '../errors/app-error.js';

// Middleware Desafío Individual A4
const validateCompletion = (req: Request, res: Response, next: NextFunction): void => {
  const completed = req.body?.completed;
  if (typeof completed !== 'boolean') {
    next(
      new AppError('La solicitud contiene datos inválidos.', 422, 'VALIDATION_ERROR', [
        { field: 'completed', message: 'Debe ser un valor booleano (true o false).' }
      ])
    );
    return;
  }
  res.locals.taskCompleted = completed;
  next();
};

export const taskRouter = Router();

taskRouter.param('id', validateTaskId);

taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskTitle, postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.patch('/:id/status', requireJson, validateCompletion, patchTaskStatus);
taskRouter.delete('/:id', removeTask);
