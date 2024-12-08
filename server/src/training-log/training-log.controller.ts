import { Controller, Delete, Get } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingLogService } from './training-log.service';

@Controller('training-log')
export class TrainingLogController {
  constructor(private readonly trainingLogService: TrainingLogService) {}

  @Get('notifications')
  async getAmountOfUnseedTrainingLogNotifcations(@GetUser() userId: string) {
    return await this.trainingLogService.getAmoutOFTrainingLogNotificationsByUserId(userId);
  }

  @Delete('notifications')
  async resetUnseenTrainingLogNotifications(@GetUser() userId: string) {
    return await this.trainingLogService.deleteLogsByUser(userId);
  }
}
