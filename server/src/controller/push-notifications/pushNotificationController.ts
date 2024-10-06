import { Request, Response } from 'express';
import { NotFoundError } from '../../errors/notFoundError.js';
import fingerprintService from '../../service/fingerprintService.js';
import pushSubscriptionService from '../../service/notifications/push-subscription-service.js';
import userManager from '../../service/userManager.js';
import { PushSubscriptionRequest } from './push-subscription-request.js';

export async function createPushNotificationSubscriptionForUser(
  req: PushSubscriptionRequest,
  res: Response
): Promise<Response> {
  const { subscription } = req.body;

  const user = await userManager.getUser(res);

  if (!subscription) {
    throw new NotFoundError('Es muss eine Subscription übergeben werden.');
  }

  const clientFingerPrint = fingerprintService.generateDeviceFingerprint(req);

  await pushSubscriptionService.saveSubscription(user.id, subscription, clientFingerPrint);
  return res.status(201).json({ message: 'Push-Subscription gespeichert.' });
}

export async function deletePushNotificationSubscriptionForUser(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);
  const subscription = await pushSubscriptionService.getSubscriptionsByUserId(user.id);

  if (!subscription) {
    throw new NotFoundError('Keine Subscription gefunden.');
  }

  await pushSubscriptionService.deleteSubscription(user.id);
  return res.status(200).json({ message: 'Subscription erfolgreich gelöscht.' });
}

export async function deleteSchema(req: Request, res: Response): Promise<Response> {
  await pushSubscriptionService.deleteSubscriptions();
  return res.status(200).json({ message: 'Datenbankschema zurückgesetzt' });
}
