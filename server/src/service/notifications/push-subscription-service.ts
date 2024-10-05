import webPush, { PushSubscription } from 'web-push';
import { NotFoundError } from '../../errors/notFoundError.js';
import { UserPushSubscription } from '../../models/collections/push-subscription.js';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { NotificationPayload } from './notification-payload.js';

class PushSubscriptionService {
  private pushSubscriptionDAO!: MongoGenericDAO<UserPushSubscription>;

  setPushSubscriptionDAO(pushSubscriptionDAO: MongoGenericDAO<UserPushSubscription>) {
    this.pushSubscriptionDAO = pushSubscriptionDAO;
  }

  async sendNotification(userId: string, notifcationPayload: NotificationPayload) {
    const subscriptions = await this.getSubscriptionsByUserId(userId);

    if (subscriptions.length === 0) {
      throw new NotFoundError('Keine Push-Subscription für diesen Benutzer gefunden');
    }

    const notificationPayload = {
      title: notifcationPayload.title,
      body: notifcationPayload.body,
      url: notifcationPayload.url,
      vibrate: notifcationPayload.vibrate
    };

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, JSON.stringify(notificationPayload));
      } catch (error) {
        await this.deleteSubscription(subscription.userId);
      }
    }
  }

  async saveSubscription(userId: string, subscription: PushSubscription) {
    const existingSubscription = await this.pushSubscriptionDAO.findOne({ userId });

    if (existingSubscription) {
      await this.pushSubscriptionDAO.update(existingSubscription);
      return;
    }

    await this.pushSubscriptionDAO.create({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys
    });
  }

  async getSubscriptionsByUserId(userId: string): Promise<UserPushSubscription[]> {
    return this.pushSubscriptionDAO.findByCondition({ userId });
  }

  async deleteSubscription(userId: string): Promise<number> {
    return await this.pushSubscriptionDAO.deleteAll({ userId });
  }
}

export default new PushSubscriptionService();
