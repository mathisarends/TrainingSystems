import express from 'express';
import * as pushNotificationController from '../controller/push-notifications/pushNotificationController.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authService } from '../service/authService.js';

const pushNotificationRouter = express.Router();

pushNotificationRouter.post(
  '/subscribe',
  authService.authenticationMiddleware,
  asyncHandler(pushNotificationController.createPushNotificationSubscriptionForUser)
);

pushNotificationRouter.post(
  '/unsubscribe',
  authService.authenticationMiddleware,
  asyncHandler(pushNotificationController.deletePushNotificationSubscriptionForUser)
);

// Zu Migrationszwecken: TODO: entfernen
pushNotificationRouter.delete('/reset-schema', asyncHandler(pushNotificationController.deleteSchema));

export default pushNotificationRouter;
