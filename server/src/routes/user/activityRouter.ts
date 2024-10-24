import express from 'express';
import * as activityController from '../../controller/activityController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const activityRouter = express.Router();

// TODO: activity calendar muss noch umgesetzt werdern
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

activityRouter.get(
  '/training-day/:id',
  authService.authenticationMiddleware,
  asyncHandler(activityController.getTrainingDayById)
);

export default activityRouter;
