import express from 'express';
import { authService } from '../../service/authService.js';

import * as trainingSessionStatisticsController from '../../controller/session/sessionStatisticsController.js';
import { asyncHandler } from '../../middleware/error-handler.js';

const trainingSessionStatisticsRouter = express.Router();

trainingSessionStatisticsRouter.get(
  '/exercises/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingSessionStatisticsController.getExercisesFromTrainingSession)
);

trainingSessionStatisticsRouter.get(
  '/tonnage/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingSessionStatisticsController.getTonnageCharts)
);

trainingSessionStatisticsRouter.get(
  '/performance/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingSessionStatisticsController.getPerformanceCharts)
);

export default trainingSessionStatisticsRouter;
