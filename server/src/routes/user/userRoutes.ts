import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';
import authRouter from './authRoutes.js';
import gymTicketRouter from './gymTicketRouter.js';
import permissionRouter from './permissionRouter.js';
import profileRouter from './profileRouter.js';

const userRouter = express.Router();

userRouter.use('/gym-ticket', gymTicketRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/auth', authRouter);
userRouter.use('/permissions', permissionRouter);

userRouter.get(
  '/activity-calendar',
  authService.authenticationMiddleware,
  asyncHandler(userController.getActivityCalendar)
);

userRouter.get(
  '/recent-training-durations',
  authService.authenticationMiddleware,
  asyncHandler(userController.getRecentTrainingDurations)
);

userRouter.get(
  '/training-notifications',
  authService.authenticationMiddleware,
  asyncHandler(userController.getTrainingDayNotifications)
);

userRouter.delete(
  '/training-notification/:id',
  authService.authenticationMiddleware,
  asyncHandler(userController.deleteTrainingDayNotification)
);

userRouter.get(
  '/training-day/:id',
  authService.authenticationMiddleware,
  asyncHandler(userController.getTrainingDayById)
);

export default userRouter;
