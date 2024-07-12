import express from 'express';
import * as userController from '../controller/userController.js';
import { authService } from '../service/authService.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/login/oauth2', userController.loginOAuth2);
router.get('/profile', authService.authenticationMiddleware, userController.getProfile);

export default router;
