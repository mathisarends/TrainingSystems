import { PushSubscription } from 'web-push';
import { UserPushSubscription } from '../models/collections/push-subscription.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';

class PushSubscriptionService {
  private pushSubscriptionDAO!: MongoGenericDAO<UserPushSubscription>;

  setPushSubscriptionDAO(pushSubscriptionDAO: MongoGenericDAO<UserPushSubscription>) {
    this.pushSubscriptionDAO = pushSubscriptionDAO;
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

  async deleteSubscription(userId: string) {
    await this.pushSubscriptionDAO.delete(userId);
  }
}

export default new PushSubscriptionService();
