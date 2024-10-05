import { Request, Response } from 'express';
import { NotFoundError } from '../../errors/notFoundError.js';
import pushSubscriptionService from '../../service/push-subscription-service.js';
import userManager from '../../service/userManager.js';
import { PushSubscriptionRequest } from './push-subscription-request.js';

export async function createPushNotificationSubscriptionForUser(
  req: PushSubscriptionRequest,
  res: Response
): Promise<void> {
  const { subscription } = req.body;

  const user = await userManager.getUser(res);

  if (!subscription) {
    throw new NotFoundError('Es muss eine Subscription übergeben werden.');
  }

  await pushSubscriptionService.saveSubscription(user.id, subscription);
  res.status(201).json({ message: 'Push-Subscription gespeichert.' });
}

export async function deletePushNotificationSubscriptionForUser(req: Request, res: Response): Promise<void> {
  const user = await userManager.getUser(res);
  const subscription = await pushSubscriptionService.getSubscriptionsByUserId(user.id);

  if (!subscription) {
    throw new NotFoundError('Keine Subscription gefunden.');
  }

  await pushSubscriptionService.deleteSubscription(user.id);
  res.status(200).json({ message: 'Subscription erfolgreich gelöscht.' });
}
