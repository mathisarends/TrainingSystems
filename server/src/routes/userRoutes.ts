import express from 'express';
import { authService } from '../service/authService.js';
import UserController from '../controller/userController.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

const userController = new UserController();

// Weise die Methoden der UserController-Klasse den Routen zu
router.post('/register', asyncHandler(userController.register));
router.post('/login', asyncHandler(userController.login));
router.post('/login/oauth2', asyncHandler(userController.loginOAuth2));
router.get('/profile', authService.authenticationMiddleware, asyncHandler(userController.getProfile));
router.post(
  '/update-profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(userController.updateProfilePicture)
);

router.post('/logout', userController.signOut);

export default router;
