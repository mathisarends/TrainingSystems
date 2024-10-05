import { UserPushSubscription } from '../models/collections/push-subscription.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';

class PushSubscriptionService {
  private pushSubscriptionDAO!: MongoGenericDAO<UserPushSubscription>;

  setPushSubscriptionDAO(pushSubscriptionDAO: MongoGenericDAO<UserPushSubscription>) {
    this.pushSubscriptionDAO = pushSubscriptionDAO;
  }
}

export default new PushSubscriptionService();
