import { Body, Controller, Post } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotiifcationService: PushNotificationsService,
  ) {}

  @Post()
  async createPushNotificationSubscriptionForUser(
    @GetUser() userId: string,
    @Body() createPushSubscriptionDto: CreatePushSubscriptionDto,
  ) {
    await this.pushNotiifcationService.createPushNotificationSubscriptionForUser(
      userId,
      createPushSubscriptionDto,
    );
  }
}
