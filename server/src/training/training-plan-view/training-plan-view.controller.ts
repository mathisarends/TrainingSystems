import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ApiData } from 'src/types/api-data';
import { TrainingDayExerciseDto } from './dto/training-day-exercise.dto';
import { TrainingPlanViewUpdateService } from './training-plan-view-update.service';
import { TrainingPlanViewService } from './training-plan-view.service';
import { TrainingPlanViewUpdateService2 } from './training-view-update-2.service';
import { ExerciseDto } from '../model/exercise.schema';
import { TrainingExerciseDeleteService } from './model/training-exercise-delete.service';
import { TrainingDayExercisesRearrangementDto } from '../dto/training-day-exercises-rearrangement.dto';
import { TrainingViewExerciseRearrangementService } from './training-view-exercise-rearrangement.service';

@Controller('training-plan-view')
export class TrainingPlanViewController {
  constructor(
    private readonly trainingPlanViewService: TrainingPlanViewService,
    private readonly trainingPlanViewUpdateService: TrainingPlanViewUpdateService,
    private readonly trainingViewUpdateService2: TrainingPlanViewUpdateService2,
    private readonly trainingExerciseDeleteService: TrainingExerciseDeleteService,
    private readonly trainingViewRearrangementService: TrainingViewExerciseRearrangementService,
  ) {}

  @Get(':id/:week/:day')
  async getTrainingDayData(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
  ) {
    return await this.trainingPlanViewService.getTrainingDayView(userId, trainingPlanId, weekIndex, dayIndex);
  }

  @Patch('/exercise-order/:id/:week/:day/')
  async rearrangeExerciseOrder(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() trainingDayExercisesRearrangementDto: TrainingDayExercisesRearrangementDto,
  ) {
    return await this.trainingViewRearrangementService.rearrangeExerciseOrder(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
      trainingDayExercisesRearrangementDto,
    );
  }

  @Patch(':id/:week/:day/2')
  async updateTrainingDataForTrainingDay2(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() trainingDayExerciseDto: TrainingDayExerciseDto,
  ): Promise<ExerciseDto> {
    return await this.trainingViewUpdateService2.updateTrainingDataForTrainingDay(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
      trainingDayExerciseDto,
    );
  }

  @Patch(':id/:week/:day/2/delete')
  async deleteExerciseFromTrainingDay(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() trainingDayExerciseDto: TrainingDayExerciseDto,
  ): Promise<ExerciseDto> {
    return await this.trainingExerciseDeleteService.deleteExerciseFromTrainingDay(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
      trainingDayExerciseDto,
    );
  }

  @Patch(':id/:week/:day')
  async updateTrainingDataForTrainingDay(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
    @Body() changedData: ApiData,
  ): Promise<void> {
    return await this.trainingPlanViewUpdateService.updateTrainingDataForTrainingDay(
      userId,
      trainingPlanId,
      weekIndex,
      dayIndex,
      changedData,
    );
  }
}
