import { Controller, Delete, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { RestTimerKeepAliveService } from './rest-timer-keep-alive.service';

@Controller('training-timer')
export class TrainingTimerController {
  constructor(private readonly restTimerKeepAliveService: RestTimerKeepAliveService) {}

  @Post()
  keepTimerAlive(@GetUser() userId: string, @Req() req: Request) {
    this.restTimerKeepAliveService.startTimer(userId);
  }

  @Delete()
  stopKeepTimerAliveSignal(@GetUser() userId: string, @Req() req: Request) {
    this.restTimerKeepAliveService.stopTimer(userId);
  }
}
