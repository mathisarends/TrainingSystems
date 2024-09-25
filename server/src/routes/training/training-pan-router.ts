import express from 'express';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

import * as trainingController from '../../controller/training/trainingController.js';
import * as trainingDayController from '../../controller/training/trainingDayController.js';

const trainingPlanRouter = express.Router();

trainingPlanRouter.get(
  '/:id/:week/:day',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.getPlanForDay)
);

trainingPlanRouter.patch(
  '/:id/:week/:day',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.updateTrainingDataForTrainingDay)
);
trainingPlanRouter.get(
  '/:id/latest',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.getLatestTrainingDay)
);

trainingPlanRouter.post(
  '/:id/auto-progression',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.autoProgressionForTrainingPlan)
);

export default trainingPlanRouter;
