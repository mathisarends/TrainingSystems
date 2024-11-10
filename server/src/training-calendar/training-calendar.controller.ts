import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingRetrospectivePopupCardInfo } from './dto/training-retrospective-popup-card-info.dto';
import { TrainingCalendarService } from './training-calendar.service';
import { TrainingDayInfoService } from './training-day-info.service';

@Controller('training-calendar')
export class TrainingCalendarController {
  constructor(
    private readonly trainingCalendarService: TrainingCalendarService,
    private readonly trainingDayInfoService: TrainingDayInfoService,
  ) {}

  @Get()
  async getCalendarDataForUser(@GetUser() userId: string) {
    return this.trainingCalendarService.getCalendarDataForUser(userId);
  }

  @Get('/training-day/popup-card/:planId/:weekIndex/:dayIndex')
  async getTrainingRetrospectivePopupCardInfo(
    @GetUser() userId: string,
    @Param('planId') planId: string,
    @Param('weekIndex', ParseIntPipe) weekIndex: number,
    @Param('dayIndex', ParseIntPipe) dayIndex: number,
  ): Promise<TrainingRetrospectivePopupCardInfo> {
    return await this.trainingDayInfoService.getTrainingRetrospectivePopupCardInfo(
      userId,
      planId,
      weekIndex,
      dayIndex,
    );
  }

  @Get('/training-day-info/:planId/:weekIndex/:dayIndex')
  async getTrainingDayInfo(
    @GetUser() userId: string,
    @Param('planId') planId: string,
    @Param('weekIndex', ParseIntPipe) weekIndex: number,
    @Param('dayIndex', ParseIntPipe) dayIndex: number,
  ) {
    return await this.trainingDayInfoService.getTrainingDayInfo(
      userId,
      planId,
      weekIndex,
      dayIndex,
    );
  }
}
