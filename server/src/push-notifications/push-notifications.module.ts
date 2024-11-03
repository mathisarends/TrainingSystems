// push-notifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FingerprintService } from './fingerprint.service';
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
  providers: [PushNotificationsService, FingerprintService],
  controllers: [PushNotificationsController],
  exports: [PushNotificationsService, FingerprintService, MongooseModule],
})
export class PushNotificationsModule {}