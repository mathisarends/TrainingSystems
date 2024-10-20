import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
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
    @Body() createPushSubscriptionDto: CreatePushSubscriptionDto,
  ) {
    const user = request['user'];
    const fingerprint = this.fingerprintService.generateFingerprint(request);
    await this.pushNotiifcationService.createPushNotificationSubscriptionForUser(
      user.id,
      fingerprint,
      createPushSubscriptionDto,
    );
  }
}
