import express from 'express';
import * as trainingController from '../../controller/training/trainingController.js';
import * as trainingDayController from '../../controller/training/trainingDayController.js';

import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';
import statisticsRouter from './training-statistics-router.js';
const router = express.Router();

router.use('/statistics', statisticsRouter);

/** Lädt eine Kartenansicht mit allen Trainingspplänen */
router.get('/plans', authService.authenticationMiddleware, asyncHandler(trainingController.getPlans));
router.post('/reorder', authService.authenticationMiddleware, asyncHandler(trainingController.updateTrainingPlanOrder));
router.post('/create', authService.authenticationMiddleware, asyncHandler(trainingController.createPlan));
router.delete('/delete/:planId', authService.authenticationMiddleware, asyncHandler(trainingController.deletePlan));
router.get('/edit/:id', authService.authenticationMiddleware, asyncHandler(trainingController.getPlanForEdit));
router.patch('/edit/:id', authService.authenticationMiddleware, asyncHandler(trainingController.updatePlan));

// Auf einen Trainingstag bezogen
router.get(
  '/plan/:id/:week/:day',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.getPlanForDay)
);

router.patch(
  '/plan/:id/:week/:day',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.updateTrainingDataForTrainingDay)
);
router.get(
  '/plan/:id/latest',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.getLatestTrainingDay)
);

router.post(
  '/plan/:id/auto-progression',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.autoProgressionForTrainingPlan)
);

export default router;
