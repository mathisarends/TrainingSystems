import express from 'express';
import * as userController from '../controller/userController.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authService } from '../service/authService.js';
import { getUser } from '../service/userService.js';

const router = express.Router();

router.post('/register', asyncHandler(userController.register));
router.post('/login', asyncHandler(userController.login));
router.post('/login/oauth2', asyncHandler(userController.loginOAuth2));
router.get('/profile', authService.authenticationMiddleware, asyncHandler(userController.getProfile));
router.post('/profile', authService.authenticationMiddleware, asyncHandler(userController.editProfile));

router.get('/permissions', authService.authenticationMiddleware, asyncHandler(userController.getPermisisons));
router.post('/permissions', authService.authenticationMiddleware, asyncHandler(userController.updatePermissions));

router.post('/send-reset-password-email', asyncHandler(userController.sendPasswordResetEmail));
router.get('/authenticate-password-request/:token', asyncHandler(userController.authenticatePasswordResetPage));
router.post('/reset-password/:token', asyncHandler(userController.resetPassword));

router.get(
  '/activity-calendar',
  authService.authenticationMiddleware,
  asyncHandler(userController.getActivityCalendar)
);

router.get(
  '/recent-training-durations',
  authService.authenticationMiddleware,
  asyncHandler(userController.getRecentTrainingDurations)
);

router.get(
  '/training-notifications',
  authService.authenticationMiddleware,
  asyncHandler(userController.getTrainingDayNotifications)
);

router.delete(
  '/training-notification/:id',
  authService.authenticationMiddleware,
  asyncHandler(userController.deleteTrainingDayNotification)
);

router.get('/training-day/:id', authService.authenticationMiddleware, asyncHandler(userController.getTrainingDayById));

router.get(
  '/profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(async (req, res) => {
    const user = await getUser(req, res);

    res.status(200).json(user.pictureUrl);
  })
);

router.post(
  '/update-profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(userController.updateProfilePicture)
);

router.put('/gym-ticket', authService.authenticationMiddleware, asyncHandler(userController.uploadGymTicket));

router.get('/gym-ticket', authService.authenticationMiddleware, asyncHandler(userController.getGymTicket));

router.post('/logout', userController.signOut);

router.delete('/delete-account', authService.authenticationMiddleware, asyncHandler(userController.deleteAccount));

router.get(
  '/auth-state',
  authService.authenticationMiddleware,
  asyncHandler(async (req, res) => {
    await getUser(req, res);
    return res.status(200).json({ message: 'auth verified' });
  })
);

export default router;
