import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ApiData } from 'src/types/api-data';
import { TrainingPlanViewUpdateService } from '../service/training-plan-view-update.service';
import { TrainingPlanViewService } from '../service/training-plan-view.service';

@Controller('training-plan-view')
export class TrainingPlanViewController {
  constructor(
    private readonly trainingPlanViewService: TrainingPlanViewService,
    private readonly tariningPlanViewUpdateService: TrainingPlanViewUpdateService,
  ) {}

  // TOODO: use validation service to retrive training day which can be shared for update and get routes aswell.
  @Get(':id/:week/:day')
  async getTrainingDayData(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
  ) {
    return await this.trainingPlanViewService.getTrainingDayView(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
    );
  }

  @Patch(':id/:week/:day')
  async updateTrainingDataForTrainingDay(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() changedData: ApiData,
  ) {
    return await this.tariningPlanViewUpdateService.updateTrainingDataForTrainingDay(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
      changedData,
    );
  }
}
