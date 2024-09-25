import express from 'express';
import * as authController from '../../controller/authController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const authRouter = express.Router();

authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/login/oauth2', asyncHandler(authController.loginOAuth2));
authRouter.post('/logout', asyncHandler(authController.logOut));
authRouter.get('/auth-state', authService.authenticationMiddleware, asyncHandler(authController.getAuthState));
authRouter.post(
  '/send-reset-password-email',

  asyncHandler(authController.sendPasswordResetEmail)
);
authRouter.get('/authenticate-password-request/:token', asyncHandler(authController.authenticatePasswordResetPage));
authRouter.post('/reset-password/:token', asyncHandler(authController.resetPassword));

export default authRouter;
