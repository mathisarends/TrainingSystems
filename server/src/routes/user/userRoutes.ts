import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';
import gymTicketRouter from './gymTicketRouter.js';
import profileRouter from './profileRouter.js';

const userRouter = express.Router();

userRouter.use('/gym-ticket', gymTicketRouter);
userRouter.use('/profile', profileRouter);

userRouter.post('/register', asyncHandler(userController.register));
userRouter.post('/login', asyncHandler(userController.login));
userRouter.post('/login/oauth2', asyncHandler(userController.loginOAuth2));

userRouter.get('/permissions', authService.authenticationMiddleware, asyncHandler(userController.getPermisisons));
userRouter.post('/permissions', authService.authenticationMiddleware, asyncHandler(userController.updatePermissions));

userRouter.post('/send-reset-password-email', asyncHandler(userController.sendPasswordResetEmail));
userRouter.get('/authenticate-password-request/:token', asyncHandler(userController.authenticatePasswordResetPage));
userRouter.post('/reset-password/:token', asyncHandler(userController.resetPassword));

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

userRouter.post('/logout', userController.signOut);

userRouter.get('/auth-state', authService.authenticationMiddleware, asyncHandler(userController.getAuthState));

export default userRouter;
