import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';
import { getUser } from '../../service/userService.js';

const profileRouter = express.Router();

profileRouter.get('/', authService.authenticationMiddleware, asyncHandler(userController.getProfile));
profileRouter.post('/', authService.authenticationMiddleware, asyncHandler(userController.editProfile));

profileRouter.get(
  '/profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(async (req, res) => {
    const user = await getUser(req, res);
    res.status(200).json(user.pictureUrl);
  })
);

profileRouter.post(
  '/update-profile-picture',
  authService.authenticationMiddleware,
  asyncHandler(userController.updateProfilePicture)
);

profileRouter.delete(
  '/delete-account',
  authService.authenticationMiddleware,
  asyncHandler(userController.deleteAccount)
);

export default profileRouter;
