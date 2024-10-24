import { Controller, Delete, Get, Param } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingService } from 'src/training/training.service';
import { TrainingLogService } from './training-log.service';

@Controller('training-log')
export class TrainingLogController {
  constructor(
    private readonly trainingLogService: TrainingLogService,
    private readonly trainingService: TrainingService,
  ) {}

  @Get()
  async getTrainingLogForUser(@GetUser() userId: string) {
    return await this.trainingLogService.getTrainingLogsByUserId(userId);
  }

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
  async getRouteParamsForTrainingDayNavigation(
    @GetUser() userId: string,
    @Param('id') trainingDayId: string,
  ) {
    const trainingPlans =
      await this.trainingService.getTrainingPlansByUser(userId);
    return this.trainingService.getTrainingDayById(
      trainingPlans,
      trainingDayId,
    );
  }
}
