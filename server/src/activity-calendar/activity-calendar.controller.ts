import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingService } from 'src/training/training.service';
import { ActivityCalendarService } from './activity-calendar.service';

@Controller('activity-calendar')
export class ActivityCalendarController {
  constructor(
    private readonly actvityCalendarService: ActivityCalendarService,
    private readonly trainingService: TrainingService,
  ) {}

  @Get()
  async getActivityCalendar(@GetUser() userId: string) {
    const trainingPlans =
      await this.trainingService.getTrainingPlansByUser(userId);

    return this.actvityCalendarService.geetActivityCalendar(trainingPlans);
  }
}