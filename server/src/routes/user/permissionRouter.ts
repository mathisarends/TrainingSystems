import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const permissionRouter = express.Router();

permissionRouter.get('/', authService.authenticationMiddleware, asyncHandler(userController.getPermisisons));
permissionRouter.post('/', authService.authenticationMiddleware, asyncHandler(userController.updatePermissions));

export default permissionRouter;
