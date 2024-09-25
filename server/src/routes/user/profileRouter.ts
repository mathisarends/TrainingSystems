import express from 'express';
import * as profileController from '../../controller/profileController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const profileRouter = express.Router();

profileRouter.get('/', authService.authenticationMiddleware, asyncHandler(profileController.getProfile));

profileRouter.post(
  '/update-profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(profileController.updateProfilePicture)
);

profileRouter.delete(
  '/delete-account',
  authService.authenticationMiddleware,
  asyncHandler(profileController.deleteAccount)
);

export default profileRouter;
