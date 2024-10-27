import { Controller, Delete, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { FingerprintService } from 'src/push-notifications/fingerprint.service';
import { RestTimerKeepAliveService } from '../service/rest-timer/rest-timer-keep-alive.service';

@Controller('training-timer')
export class TrainingTimerController {
  constructor(
    private readonly restTimerKeepAliveService: RestTimerKeepAliveService,
    private readonly fingerprintService: FingerprintService,
  ) {}

  @Post()
  async keepTimerAlive(@GetUser() userId: string, @Req() req: Request) {
    const fingerprint = this.fingerprintService.generateFingerprint(req);
    await this.restTimerKeepAliveService.startTimer(userId, fingerprint);
  }

  @Delete()
  stopKeepTimerAliveSignal(@GetUser() userId: string, @Req() req: Request) {
    const fingerprint = this.fingerprintService.generateFingerprint(req);
    this.restTimerKeepAliveService.stopTimer(userId, fingerprint);
  }
}