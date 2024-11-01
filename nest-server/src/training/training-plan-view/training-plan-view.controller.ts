import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { FingerprintService } from 'src/push-notifications/fingerprint.service';
import { ApiData } from 'src/types/api-data';
import { UpdateTrainingDayExerciseDto } from './model/update-training-day-exercise.dto';
import { TrainingPlanViewUpdateService } from './training-plan-view-update.service';
import { TrainingPlanViewService } from './training-plan-view.service';
import { TrainingPlanViewUpdateService2 } from './training-view-update-2.service';

@Controller('training-plan-view')
export class TrainingPlanViewController {
  constructor(
    private readonly trainingPlanViewService: TrainingPlanViewService,
    private readonly tariningPlanViewUpdateService: TrainingPlanViewUpdateService,
    private readonly fingerprintService: FingerprintService,
    private readonly trainingViewUpdateService2: TrainingPlanViewUpdateService2,
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

  @Patch(':id/:week/:day/2')
  async updateTrainingDataForTrainingDay2(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() updateTrainingDayExerciseDto: UpdateTrainingDayExerciseDto,
    @Req() req: Request,
  ) {
    const fingerprint = this.fingerprintService.generateFingerprint(req); // fingerpring könnte man auch richtig gut als annotation und über middleware steuern
    return await this.trainingViewUpdateService2.updateTrainingDataForTrainingDay(
      userId,
      fingerprint,
      trainingPlanId,
      weekIndex,
      dayIndex,
      updateTrainingDayExerciseDto.exercise,
    );
  }

  @Patch(':id/:week/:day')
  async updateTrainingDataForTrainingDay(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() changedData: ApiData,
    @Req() req: Request,
  ): Promise<void> {
    const fingerprint = this.fingerprintService.generateFingerprint(req);

    return await this.tariningPlanViewUpdateService.updateTrainingDataForTrainingDay(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
      changedData,
      fingerprint,
    );
  }
}
