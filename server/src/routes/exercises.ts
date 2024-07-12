import express from 'express';
import * as exerciseController from '../controller/exerciseController.js';
import { authService } from '../service/authService.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, exerciseController.getExercises);
router.patch('/', authService.authenticationMiddleware, exerciseController.updateExercises);
router.post('/reset', authService.authenticationMiddleware, exerciseController.resetExercises);

export default router;
