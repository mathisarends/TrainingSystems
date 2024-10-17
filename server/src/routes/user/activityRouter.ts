import express from 'express';
import * as activityController from '../../controller/activityController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const activityRouter = express.Router();

activityRouter.get(
  '/activity-calendar',
  authService.authenticationMiddleware,
  asyncHandler(activityController.getActivityCalendar)
);

activityRouter.get(
  '/training-notifications',
  authService.authenticationMiddleware,
  asyncHandler(activityController.getTrainingLogForUser)
);

activityRouter.get(
  '/unseen-training-notifications',
  authService.authenticationMiddleware,
  asyncHandler(activityController.getTrainingDayNotifications)
);

activityRouter.delete(
  '/unseen-training-notifications',
  authService.authenticationMiddleware,
  asyncHandler(activityController.resetUnseenTrainingDayNotifications)
);

// wird zum navigieren auf einene bestimmten Trainingsplan benutzt anscheinend
activityRouter.get(
  '/training-day/:id',
  authService.authenticationMiddleware,
  asyncHandler(activityController.getTrainingDayById)
);

export default activityRouter;
