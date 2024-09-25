import express from 'express';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

import * as trainingStatisticsController from '../../controller/training/trainingStatisticsController.js';

const statisticsRouter = express.Router();

statisticsRouter.get(
  '/:id/viewedCategories',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getViewedCategories)
);

statisticsRouter.post(
  '/:id/viewedCategories',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.updateViewedCategories)
);

statisticsRouter.get(
  '/:id/sets',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getSetsForCategories)
);

statisticsRouter.get(
  '/:id/performance',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getPerformanceCharts)
);

statisticsRouter.get(
  '/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getTonnageForCategories)
);

statisticsRouter.get(
  '/:id/drilldown/:category/:week',
  authService.authenticationMiddleware,
  asyncHandler(trainingStatisticsController.getDrilldownForCategory)
);

export default statisticsRouter;
