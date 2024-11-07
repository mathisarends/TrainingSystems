import { Controller, Get, Param } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { TrainingRoutineStatisticsService } from './training-routine-statistics.service';

@Controller('training-routine-statistics')
export class TrainingRoutineStatisticsController {
  constructor(
    private readonly trainingRoutineStatisticsService: TrainingRoutineStatisticsService,
  ) {}

  @Get('/tonnage/:id')
  async getTonnageCharts(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
  ) {
    const exercises =
      await this.trainingRoutineStatisticsService.getExercisesFromTrainingSession(
        userId,
        trainingRoutineId,
      );

    return this.trainingRoutineStatisticsService.getTonnageCharts(
      userId,
      trainingRoutineId,
      exercises,
    );
  }

  @Get('/performance/:id')
  async getPerformanceCharts(
    @GetUser() userId: string,
    @Param('id') trainingRoutineId: string,
  ) {
    const exercises =
      await this.trainingRoutineStatisticsService.getExercisesFromTrainingSession(
        userId,
        trainingRoutineId,
      );

    return this.trainingRoutineStatisticsService.getPerformanceCharts(
      userId,
      trainingRoutineId,
      exercises,
    );
  }
}
