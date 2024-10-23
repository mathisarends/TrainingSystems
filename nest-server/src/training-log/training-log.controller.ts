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

  @Get('notifications')
  getAmountOfUnseedTrainingLogNotifcations(@GetUser() user: User) {}

  @Delete('notifications')
  resetUnseenTrainingLogNotifications(@GetUser() user: User) {}

  @Get('training-day/:id')
  getRouteParamsForTrainingDayNavigation(@GetUser() user: User) {}
}
