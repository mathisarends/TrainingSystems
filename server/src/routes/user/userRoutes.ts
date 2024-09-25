import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';
import { getUser } from '../../service/userService.js';
import gymTicketRouter from './gymTicketRouter.js';

const userRouter = express.Router();

userRouter.use('/gym-ticket', gymTicketRouter);

userRouter.post('/register', asyncHandler(userController.register));
userRouter.post('/login', asyncHandler(userController.login));
userRouter.post('/login/oauth2', asyncHandler(userController.loginOAuth2));
userRouter.get('/profile', authService.authenticationMiddleware, asyncHandler(userController.getProfile));
userRouter.post('/profile', authService.authenticationMiddleware, asyncHandler(userController.editProfile));

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

userRouter.get(
  '/profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(async (req, res) => {
    const user = await getUser(req, res);

    res.status(200).json(user.pictureUrl);
  })
);

userRouter.post(
  '/update-profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(userController.updateProfilePicture)
);

userRouter.post('/logout', userController.signOut);

userRouter.delete('/delete-account', authService.authenticationMiddleware, asyncHandler(userController.deleteAccount));

userRouter.get('/auth-state', authService.authenticationMiddleware, asyncHandler(userController.getAuthState));

export default userRouter;
