import express from 'express';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

import * as trainingController from '../../controller/training/trainingController.js';
import * as trainingDayController from '../../controller/training/trainingDayController.js';

const trainingPlanRouter = express.Router();

// Auf die Bearbeitung
trainingPlanRouter.delete(
  '/delete/:planId',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.deletePlan)
);

// TODO: hier sind wir stehen geblieben und die Route soll hier entsprechend weiter implementiert werden
trainingPlanRouter.get(
  '/edit/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.getPlanForEdit)
);
trainingPlanRouter.patch(
  '/edit/:id',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.updatePlan)
);

// Auf die Trainingsansicht bezogen
trainingPlanRouter.get(
  '/:id/:week/:day',
  authService.authenticationMiddleware,
  asyncHandler(trainingDayController.getTrainingDayData)
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

trainingPlanRouter.get(
  '/:id/title',
  authService.authenticationMiddleware,
  asyncHandler(trainingController.getTrainingPlanTitle)
);

export default trainingPlanRouter;
