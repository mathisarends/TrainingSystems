import { Controller, Delete, Get } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingLogService } from './training-log.service';

@Controller('training-log')
export class TrainingLogController {
  constructor(private readonly trainingLogService: TrainingLogService) {}

  @Get()
  async getTrainingLogForUser(@GetUser() userId: string) {
    return await this.trainingLogService.getTrainingLogsByUserId(userId);
  }

  // TODO: diese routen hier testen + activity calendar und die letzte route hier im controller natürlich nóch implementieren
  @Get('notifications')
  async getAmountOfUnseedTrainingLogNotifcations(@GetUser() userId: string) {
    return await this.trainingLogService.getAmoutOFTrainingLogNotificationsByUserId(
      userId,
    );
  }

  @Delete('notifications')
  async resetUnseenTrainingLogNotifications(@GetUser() userId: string) {
    return await this.trainingLogService.deleteLogsByUser(userId);
  }

  @Get('training-day/:id')
  getRouteParamsForTrainingDayNavigation(@GetUser() userId: string) {}
}
