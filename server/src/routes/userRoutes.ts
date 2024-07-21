import express from 'express';
import * as userController from '../controller/userController.js';
import { authService } from '../service/authService.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/login/oauth2', userController.loginOAuth2);
router.get('/profile', authService.authenticationMiddleware, userController.getProfile);
router.post('/update-profile-picture', authService.authenticationMiddleware, userController.updateProfilePicture);

router.post('/logout', async (req, res) => {
  authService.removeToken(res);
  res.status(200).json({ message: 'Token erfolgreicht entfernt ' });
});

export default router;
