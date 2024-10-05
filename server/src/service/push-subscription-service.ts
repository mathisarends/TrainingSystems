import webPush, { PushSubscription } from 'web-push';
import { NotFoundError } from '../errors/notFoundError.js';
import { UserPushSubscription } from '../models/collections/push-subscription.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';

class PushSubscriptionService {
  private pushSubscriptionDAO!: MongoGenericDAO<UserPushSubscription>;

  setPushSubscriptionDAO(pushSubscriptionDAO: MongoGenericDAO<UserPushSubscription>) {
    this.pushSubscriptionDAO = pushSubscriptionDAO;
  }

  async sendNotification(userId: string) {
    const subscriptions = await this.getSubscriptionsByUserId(userId);
    console.log('🚀 Subscriptions retrieved:', subscriptions);

    if (subscriptions.length === 0) {
      throw new NotFoundError('Keine Push-Subscription für diesen Benutzer gefunden');
    }

    const notificationPayload = {
      title: 'Benachrichtigung',
      body: 'Sie haben eine neue Nachricht.',
      icon: '/path-to-icon.png',
      url: '/notification-url'
    };

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, JSON.stringify(notificationPayload));
      } catch (error) {
        console.log('error', error);
        console.log('❌ Push-Subscription abgelaufen oder ungültig. Lösche die Subscription:', subscription.endpoint);
        const deleteCount = await this.deleteSubscription(subscription.userId);
        console.log('🚀 ~ PushSubscriptionService ~ sendNotification ~ deleteCount:', deleteCount);
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
