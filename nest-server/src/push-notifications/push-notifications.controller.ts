import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/user.model';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { FingerprintService } from './fingerprint.service';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotiifcationService: PushNotificationsService,
    private readonly fingerprintService: FingerprintService,
  ) {}

  @Post()
  async createPushNotificationSubscriptionForUser(
    @Req() request: Request,
    @GetUser() user: User,
    @Body() createPushSubscriptionDto: CreatePushSubscriptionDto,
  ) {
    const fingerprint = this.fingerprintService.generateFingerprint(request);
    await this.pushNotiifcationService.createPushNotificationSubscriptionForUser(
      user.id,
      fingerprint,
      createPushSubscriptionDto,
    );
  }
}
