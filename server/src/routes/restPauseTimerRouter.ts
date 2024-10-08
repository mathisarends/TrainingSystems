import express from 'express';
import * as restPauseTimerController from '../controller/training/restTimerController.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authService } from '../service/authService.js';

const restPauseTimerRouter = express.Router();

restPauseTimerRouter.post(
  '/',
  authService.authenticationMiddleware,
  asyncHandler(restPauseTimerController.setPauseTimerKeepAlive)
);

export default restPauseTimerRouter;
