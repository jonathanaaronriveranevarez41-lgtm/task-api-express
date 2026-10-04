import { Router } from 'express';
import {
  getTasks,
  getTask,
  postTask,
  patchTaskComplete,
  removeTask
} from '../controllers/task.controller.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateTaskTitle } from '../middlewares/validate-task-title.middleware.js';

const router = Router();

router.param('id', validateTaskId);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', validateTaskTitle, postTask);
router.patch('/:id/complete', patchTaskComplete);
router.delete('/:id', removeTask);

export default router;
