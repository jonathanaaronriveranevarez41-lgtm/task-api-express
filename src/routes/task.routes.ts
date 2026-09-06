import { Router } from 'express';
import {
  getTasks,
  getTask,
  postTask,
  patchTaskComplete,
  patchTaskTitle,
  removeTask
} from '../controllers/task.controller.js';

export const taskRouter = Router();

taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.patch('/:id/title', patchTaskTitle);
taskRouter.delete('/:id', removeTask);
