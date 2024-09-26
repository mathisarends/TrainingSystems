import express from 'express';
import * as trainingController from '../../controller/training/trainingController.js';

import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';
import trainingPlanRouter from './training-pan-router.js';
import statisticsRouter from './training-statistics-router.js';
const router = express.Router();

router.use('/statistics', statisticsRouter);
router.use('/plan', trainingPlanRouter);

/** Lädt eine Kartenansicht mit allen Trainingspplänen */
router.get('/plans', authService.authenticationMiddleware, asyncHandler(trainingController.getPlans));
router.get(
  '/most-recent-plan-link',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.getMostRecentTrainingPlanLink)
);
router.post('/reorder', authService.authenticationMiddleware, asyncHandler(trainingController.updateTrainingPlanOrder));
router.post('/create', authService.authenticationMiddleware, asyncHandler(trainingController.createPlan));

export default router;
