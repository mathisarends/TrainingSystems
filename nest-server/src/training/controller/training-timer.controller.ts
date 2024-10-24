import { Controller, Delete, Post } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { RestTimerKeepAliveService } from '../service/rest-timer/rest-timer-keep-alive.service';

@Controller('training-timer')
export class TrainingTimerController {

  constructor(private readonly restTimerKeepAliveService: RestTimerKeepAliveService) {}

  @Post()
  async keepTimerAlive(@GetUser() userId: string) {
    await this.restTimerKeepAliveService.startTimer(userId);
  }

  @Delete()
   stopKeepTimerAliveSignal(@GetUser() userId: string) {
    this.restTimerKeepAliveService.stopTimer(userId);
  }
}
