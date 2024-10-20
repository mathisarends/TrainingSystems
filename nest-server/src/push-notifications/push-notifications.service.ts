import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webPush from 'web-push';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { UserPushSubscription } from './model/user-push-subscription.model';

@Injectable()
export class PushNotificationsService {
  constructor(
    @InjectModel(UserPushSubscription.name)
    private readonly subscriptionModel: Model<UserPushSubscription>,
  ) {
    webPush.setVapidDetails(
      `mailto:${process.env.CONTACT_EMAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_SECRET_KEY,
    );
  }

  async createPushNotificationSubscriptionForUser(
    userId: string,
    fingerprint: string,
    pushSubscriptionDto: CreatePushSubscriptionDto,
  ) {
    const { endpoint, keys } = pushSubscriptionDto;

    const updatedSubscription = await this.subscriptionModel
      .findOneAndUpdate(
        { userId, fingerprint },
        { userId, endpoint, keys, fingerprint },
        { new: true, upsert: true },
      )
      .exec();

    return updatedSubscription;
  }
}
