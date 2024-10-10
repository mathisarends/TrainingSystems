import webPush, { PushSubscription } from 'web-push';
import { NotFoundError } from '../../errors/notFoundError.js';
import { UserPushSubscription } from '../../models/collections/push-subscription.js';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { NotificationPayload } from './notification-payload.js';

class PushNotificationService {
  private pushSubscriptionDAO!: MongoGenericDAO<UserPushSubscription>;

  setPushSubscriptionDAO(pushSubscriptionDAO: MongoGenericDAO<UserPushSubscription>) {
    this.pushSubscriptionDAO = pushSubscriptionDAO;
  }

  async sendNotification(userId: string, notificationPayload: NotificationPayload, fingerprint?: string) {
    let subscriptions: UserPushSubscription[];

    if (fingerprint) {
      subscriptions = await this.pushSubscriptionDAO.findAll({ userId, fingerprint });
    } else {
      subscriptions = await this.pushSubscriptionDAO.findAll({ userId });
    }

    if (subscriptions.length === 0) {
      throw new NotFoundError('Keine Push-Subscription für diesen Benutzer gefunden');
    }

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, JSON.stringify(notificationPayload));
      } catch (error) {
        console.error('Fehler beim Senden der Push-Benachrichtigung:', error);
        await this.deleteSubscription(subscription.id);
      }
    }
  }

  async saveSubscription(userId: string, subscription: PushSubscription, fingerprint: string) {
    const existingSubscription = await this.pushSubscriptionDAO.findOne({ userId, fingerprint });

    if (existingSubscription) {
      await this.pushSubscriptionDAO.update({
        ...existingSubscription,
        endpoint: subscription.endpoint,
        keys: subscription.keys
      });
      return;
    }

    await this.pushSubscriptionDAO.create({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      fingerprint
    });
  }

  async getSubscriptionsByUserId(userId: string): Promise<UserPushSubscription[]> {
    return this.pushSubscriptionDAO.findByCondition({ userId });
  }

  async deleteSubscription(userId: string): Promise<number> {
    return await this.pushSubscriptionDAO.deleteAll({ userId });
  }

  async deleteSubscriptions(): Promise<number> {
    return await this.pushSubscriptionDAO.deleteAll();
  }
}

export default new PushNotificationService();
