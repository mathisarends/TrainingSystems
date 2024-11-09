import { Controller, Get } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingCalendarService } from './training-calendar.service';

@Controller('training-calendar')
export class TrainingCalendarController {
  constructor(
    private readonly trainingCalendarService: TrainingCalendarService,
  ) {}

  @Get()
  async getCalendarDataForUser(@GetUser() userId: string) {
    return this.trainingCalendarService.getCalendarDataForUser(userId);
  }
}
