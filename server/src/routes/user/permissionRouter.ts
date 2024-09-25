import express from 'express';
import * as permissionController from '../../controller/permissionController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const permissionRouter = express.Router();

permissionRouter.get('/', authService.authenticationMiddleware, asyncHandler(permissionController.getPermisisons));
permissionRouter.post('/', authService.authenticationMiddleware, asyncHandler(permissionController.updatePermissions));

export default permissionRouter;
