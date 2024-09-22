import express from 'express';
import * as trainingController from '../controller/training/trainingController.js';
import * as trainingDayController from '../controller/training/trainingDayController.js';
import * as trainingStatisticsController from '../controller/training/trainingStatisticsController.js';

import { asyncHandler } from '../middleware/error-handler.js';
import { authService } from '../service/authService.js';
const router = express.Router();

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

// Statistiken
router.post(
  '/statistics/:id/viewedCategories',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.updateViewedCategories)
);

router.get(
  '/statistics/:id/viewedCategories',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getViewedCategories)
);

router.get(
  '/statistics/:id/sets',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getSetsForCategories)
);

router.get(
  '/statitics/:id/performance',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getPerformanceCharts)
);

router.get(
  '/statistics/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getTonnageForCategories)
);

router.get(
  '/statistics/:id/drilldown/:category/:week',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getDrilldownForCategory)
);

export default router;
