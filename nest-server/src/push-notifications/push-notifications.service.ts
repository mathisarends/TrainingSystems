import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webPush from 'web-push';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { NotificationPayloadDto } from './model/notification-payload.dto';
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
        {
          userId,
          fingerprint,
          subscription: { endpoint, keys },
        },
        { new: true, upsert: true },
      )
      .exec();

    console.log(
      '🚀 ~ PushNotificationsService ~ updatedSubscription:',
      updatedSubscription,
    );

    return updatedSubscription;
  }

  /**
   * Sends a notification to all subscriptions associated with the user.
   */
  async sendNotification(
    userId: string,
    fingerprint: string,
    notificationPayloadDto: NotificationPayloadDto,
  ): Promise<void> {
    const subscriptions = await this.getSubscriptionsByUserId(
      userId,
      fingerprint,
    );

    if (subscriptions.length === 0) {
      throw new NotFoundException(
        `No push subscriptions found for user with id ${userId}`,
      );
    }

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(
          subscription.subscription,
          JSON.stringify(notificationPayloadDto),
        );
      } catch (error) {
        console.error(`Error sending push notification: ${error.message}`);

        // Handle invalid subscription (e.g., client unsubscribed) by removing it from the database
        if (error.statusCode === 410) {
          await this.deleteSubscription(subscription.id);
          console.log(
            `Deleted invalid subscription: ${subscription.subscription.endpoint}`,
          );
        }
      }
    }
  }

  /**
   * Retrieves all subscriptions for a given user.
   */
  private async getSubscriptionsByUserId(
    userId: string,
    fingerprint: string,
  ): Promise<UserPushSubscription[]> {
    return await this.subscriptionModel.find({ userId, fingerprint }).exec();
  }

  /**
   * Deletes a single subscription by its ID.
   */
  private async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.subscriptionModel.findByIdAndDelete(subscriptionId).exec();
  }

  /**
   * Deletes all subscriptions associated with a user.
   */
  async deleteSubscriptionsForUser(userId: string): Promise<number> {
    const result = await this.subscriptionModel.deleteMany({ userId }).exec();
    return result.deletedCount ?? 0;
  }

  /**
   * Deletes all subscriptions from the database (used for cleanup).
   */
  async deleteAllSubscriptions(): Promise<number> {
    const result = await this.subscriptionModel.deleteMany({}).exec();
    return result.deletedCount ?? 0;
  }
}
