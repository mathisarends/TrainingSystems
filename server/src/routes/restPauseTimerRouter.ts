import express from 'express';
import * as restPauseTimerController from '../controller/training/restTimerController.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authService } from '../service/authService.js';

const restPauseTimerRouter = express.Router();

restPauseTimerRouter.post(
  '/keep-alive',
  authService.authenticationMiddleware,
  asyncHandler(restPauseTimerController.setPauseTimerKeepAlive)
);

restPauseTimerRouter.post(
  '/stop-keep-alive',
  authService.authenticationMiddleware,
  asyncHandler(restPauseTimerController.stopKeepAliveSignal)
);

export default restPauseTimerRouter;
