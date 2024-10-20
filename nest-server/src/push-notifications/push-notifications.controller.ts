import { Controller, Delete, Post } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { ClientJS } from 'clientjs';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotiifcationService: PushNotificationsService,
  ) {}

  @Post()
  createPushNotificationSubscriptionForUser() {

  }

  @Delete()
  deletePushNotificationSubscriptionForUser() {}

  /* Generating fingerprint with cleintjs const client = new ClientJS();

// Generate fingerprint
const fingerprint = client.getFingerprint();
console.log(fingerprint); *//
}
