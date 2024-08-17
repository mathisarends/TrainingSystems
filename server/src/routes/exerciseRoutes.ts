import express from 'express';
import * as exerciseController from '../controller/exerciseController.js';
import { authService } from '../service/authService.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, asyncHandler(exerciseController.getExercises));
router.patch('/', authService.authenticationMiddleware, asyncHandler(exerciseController.updateExercises));
router.post('/reset', authService.authenticationMiddleware, asyncHandler(exerciseController.resetExercises));

router.get('/categories', authService.authenticationMiddleware, exerciseController.getCategories);

router.get(
  '/exercises/:category',
  authService.authenticationMiddleware,
  asyncHandler(exerciseController.getExercisesByCategory)
);

export default router;
