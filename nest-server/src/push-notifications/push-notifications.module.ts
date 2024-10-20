import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserPushSubscription,
  UserPushSubscriptionSchema,
} from './model/user-push-subscription.model';
import { PushNotificationsController } from './push-notifications.controller';
import { PushNotificationsService } from './push-notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPushSubscription.name, schema: UserPushSubscriptionSchema },
    ]),
  ],
  providers: [PushNotificationsService],
  controllers: [PushNotificationsController],
})
export class PushNotificationsModule {}
