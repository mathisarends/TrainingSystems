import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const activityRouter = express.Router();

activityRouter.get(
  '/activity-calendar',
  authService.authenticationMiddleware,
  asyncHandler(userController.getActivityCalendar)
);

activityRouter.get(
  '/recent-training-durations',
  authService.authenticationMiddleware,
  asyncHandler(userController.getRecentTrainingDurations)
);

activityRouter.get(
  '/training-notifications',
  authService.authenticationMiddleware,
  asyncHandler(userController.getTrainingDayNotifications)
);

activityRouter.delete(
  '/training-notification/:id',
  authService.authenticationMiddleware,
  asyncHandler(userController.deleteTrainingDayNotification)
);

// wird zum navigieren auf einene bestimmten Trainingsplan benutzt anscheinend
activityRouter.get(
  '/training-day/:id',
  authService.authenticationMiddleware,
  asyncHandler(userController.getTrainingDayById)
);

export default activityRouter;
