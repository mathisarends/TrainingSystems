import { Controller, Delete, Post } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotiifcationService: PushNotificationsService,
  ) {}

  @Post()
  createPushNotificationSubscriptionForUser() {}

  @Delete()
  deletePushNotificationSubscriptionForUser() {}
}
