import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { User } from 'src/users/user.model';
import { VolumeStatisticsService } from '../service/statistics/training-plan-statistics.service';
import { CommaSeparatedStringsPipe } from '../utils/comma-seperated-strings.pipe';
import { ExerciseCategoryTypePipe } from '../utils/exercise-category-type.pipe';

// TODO: hier weitermachen (die routen nach und nach implementieren)

@Controller('training-plan/statistics')
export class TrainingStatisticsController {
  constructor(private volumeStatisticsService: VolumeStatisticsService) {}

  @Get('volume-comparison')
  async getVolumeComparison(
    @GetUser() user: User,
    @Query('plans', CommaSeparatedStringsPipe) trainingPlanTitles: string[],
    @Query('category', ExerciseCategoryTypePipe)
    exerciseCategories: ExerciseCategoryType[],
  ) {
    const exerciseCategory = exerciseCategories[0]; // only one category can be compared over multiple plans by now
    return await this.volumeStatisticsService.getVolumeComparison(
      user.id,
      trainingPlanTitles,
      exerciseCategory,
    );
  }

  @Get('performance-comparison')
  async getPerformanceComparisonCharts(@GetUser() user: User) {}

  @Get("':id/viewedCategories'")
  async getViewedCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {}

  @Post(':id/viewedCategorie')
  async updateViewedCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {}

  @Get(':id/sets')
  async getSetsForCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {}

  @Get(':id/performance')
  async getPerformanceCharts(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {}

  @Get(':id/volume')
  async getTonnageForCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {}

  @Get(':id/session-durations')
  async getAverageSessionDurationDataForTrainingPlanDay(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {}
}
