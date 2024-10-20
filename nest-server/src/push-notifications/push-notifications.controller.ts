import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotiifcationService: PushNotificationsService,
  ) {}

  @Post()
  async createPushNotificationSubscriptionForUser(
    @Req() request: Request,
    @Body() createPushSubscriptionDto: CreatePushSubscriptionDto,
  ) {
    const user = request['user'];
    await this.pushNotiifcationService.createPushNotificationSubscriptionForUser(
      user.id,
      createPushSubscriptionDto,
    );
  }
}
