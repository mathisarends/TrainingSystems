import express from 'express';
import * as trainingController from '../controller/training/trainingController.js';
import * as trainingDayController from '../controller/training/trainingDayController.js';
import * as trainingStatisticsController from '../controller/training/trainingStatisticsController.js';

import { authService } from '../service/authService.js';
import { asyncHandler } from '../middleware/error-handler.js';
const router = express.Router();

/** Lädt eine Kartenansicht mit allen Trainingspplänen */
router.get('/plans', authService.authenticationMiddleware, asyncHandler(trainingController.getPlans));
router.post('/create', authService.authenticationMiddleware, asyncHandler(trainingController.createPlan));
router.delete('/delete/:planId', authService.authenticationMiddleware, asyncHandler(trainingController.deletePlan));
router.get('/edit/:id', authService.authenticationMiddleware, asyncHandler(trainingController.getPlanForEdit));
router.patch('/edit/:id', authService.authenticationMiddleware, asyncHandler(trainingController.updatePlan));

// Auf einen Trainingstag bezogen
router.get('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingDayController.getPlanForDay);
router.patch(
  '/plan/:id/:week/:day',
  authService.authenticationMiddleware,
  trainingDayController.updateTrainingDataForTrainingDay
);
router.get('/plan/:id/latest', authService.authenticationMiddleware, trainingDayController.getLatestTrainingDay);

// Statistiken
router.post(
  '/statistics/:id/viewedCategories',
  authService.authenticationMiddleware,
  trainingStatisticsController.updateViewedCategories
);

router.get(
  '/statistics/:id/viewedCategories',
  authService.authenticationMiddleware,
  trainingStatisticsController.getViewedCategories
);

router.get(
  '/statistics/:id/sets',
  authService.authenticationMiddleware,
  trainingStatisticsController.getSetsForCategories
);

router.get(
  '/statistics/:id',
  authService.authenticationMiddleware,
  trainingStatisticsController.getTonnageForCategories
);

router.get(
  '/statistics/:id/drilldown/:category/:week',
  authService.authenticationMiddleware,
  trainingStatisticsController.getDrilldownForCategory
);

export default router;
