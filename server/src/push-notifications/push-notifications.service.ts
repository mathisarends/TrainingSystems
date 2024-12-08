import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webPush from 'web-push';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { NotificationPayloadDto } from './model/notification-payload.dto';
import { UserPushSubscription } from './model/user-push-subscription.model';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

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

  async createPushNotificationSubscriptionForUser(userId: string, pushSubscriptionDto: CreatePushSubscriptionDto) {
    const { endpoint, keys } = pushSubscriptionDto;

    const updatedSubscription = await this.subscriptionModel
      .findOneAndUpdate(
        { userId },
        {
          userId,
          subscription: { endpoint, keys },
        },
        { new: true, upsert: true },
      )
      .exec();

    return updatedSubscription;
  }

  /**
   * Sends a notification to all subscriptions associated with the user.
   */
  async sendNotification(userId: string, notificationPayloadDto: NotificationPayloadDto): Promise<void> {
    const subscriptions = await this.getSubscriptionsByUserId(userId);

    if (subscriptions.length === 0) {
      throw new NotFoundException(`No push subscriptions found for user with id ${userId}`);
    }

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription.subscription, JSON.stringify(notificationPayloadDto));
      } catch (error) {
        console.error(`Error sending push notification: ${error.message}`);

        if (error.statusCode === 410) {
          const deleteCount = await this.deleteSubscription(subscription.id);
          this.logger.debug(
            `Failed to send keep-alive signal to user: ${userId} and delete ${deleteCount} entries`,
            error.stack,
          );
        }
      }
    }
  }

  /**
   * Retrieves all subscriptions for a given user.
   */
  private async getSubscriptionsByUserId(userId: string): Promise<UserPushSubscription[]> {
    return await this.subscriptionModel.find({ userId }).exec();
  }

  /**
   * Deletes a single subscription by its ID and returns the number of deleted entries.
   */
  private async deleteSubscription(subscriptionId: string): Promise<number> {
    const result = await this.subscriptionModel.deleteOne({ _id: subscriptionId }).exec();
    return result.deletedCount || 0;
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
