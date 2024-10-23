import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { User } from 'src/users/user.model';
import { ExerciseCategoryTypePipe } from '../utils/exercise-category-type.pipe';

// TODO: hier weitermachen (die routen nach und nach implementieren)

@Controller('training-plan/statistics')
export class TrainingStatisticsController {
  @Get('volume-comparison')
  async getVolumeComparison(
    @GetUser() user: User,
    @Query('plans') plans: string,
    @Query('category', ExerciseCategoryTypePipe)
    exerciseCategories: ExerciseCategoryType[],
  ) {
    const trainingPlanTitles = plans.split(',');
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
