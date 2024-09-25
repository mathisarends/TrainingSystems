import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';

const authRouter = express.Router();

authRouter.post('/register', asyncHandler(userController.register));
authRouter.post('/login', asyncHandler(userController.login));
authRouter.post('/login/oauth2', asyncHandler(userController.loginOAuth2));
authRouter.post('/logout', asyncHandler(userController.signOut));
authRouter.post('/send-reset-password-email', asyncHandler(userController.sendPasswordResetEmail));
authRouter.get('/authenticate-password-request/:token', asyncHandler(userController.authenticatePasswordResetPage));
authRouter.post('/reset-password/:token', asyncHandler(userController.resetPassword));
authRouter.get('/auth-state', asyncHandler(userController.getAuthState));

export default authRouter;
