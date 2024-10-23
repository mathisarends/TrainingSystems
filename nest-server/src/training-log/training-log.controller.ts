import { Controller, Delete, Get } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/user.model';
import { TrainingLogService } from './training-log.service';

@Controller('training-log')
export class TrainingLogController {
  constructor(private readonly trainingLogService: TrainingLogService) {}

  @Get()
  async getTrainingLogForUser(@GetUser() user: User) {
    return await this.trainingLogService.getTrainingLogsByUserId(user.id);
  }

  // TODO: diese routen hier testen + activity calendar und die letzte route hier im controller natürlich nóch implementieren
  @Get('notifications')
  async getAmountOfUnseedTrainingLogNotifcations(@GetUser() user: User) {
    return await this.trainingLogService.getAmoutOFTrainingLogNotificationsByUserId(
      user.id,
    );
  }

  @Delete('notifications')
  async resetUnseenTrainingLogNotifications(@GetUser() user: User) {
    return await this.trainingLogService.deleteLogsByUser(user.id);
  }

  @Get('training-day/:id')
  getRouteParamsForTrainingDayNavigation(@GetUser() user: User) {}
}
