import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { TrainingService } from '../training.service';
import { CommaSeparatedStringsPipe } from '../utils/comma-seperated-strings.pipe';
import { ExerciseCategoryTypePipe } from '../utils/exercise-category-type.pipe';
import { PerformanceProgressionService } from './service/performance-progression.service';
import { PlanComparisonStaticsService } from './service/plan-comparison-statistics.service';
import { RecentlyViewedCategoriesService } from './service/recently-viewed-categories.service';
import { SessionDurationService } from './service/session-duration.service';
import { SetProgressionService } from './service/set-prpgression.service';
import { TonnageProgressionService } from './service/tonnage-progression.service';

@Controller('training-plan-statistics')
export class TrainingStatisticsController {
  constructor(
    private planComparisonStaticsService: PlanComparisonStaticsService,
    private recentlyViewedCategoriesService: RecentlyViewedCategoriesService,
    private setProgressionService: SetProgressionService,
    private trainingService: TrainingService,
    private performanceProgressionService: PerformanceProgressionService,
    private tonnageProgressionService: TonnageProgressionService,
    private sessionDurationService: SessionDurationService,
  ) {}

  @Get('volume-comparison')
  async getVolumeComparison(
    @GetUser() userId: string,
    @Query('plans', CommaSeparatedStringsPipe) trainingPlanTitles: string[],
    @Query('categories', ExerciseCategoryTypePipe)
    exerciseCategories: ExerciseCategoryType[],
  ) {
    return await this.planComparisonStaticsService.getVolumeComparison(userId, trainingPlanTitles, exerciseCategories);
  }

  @Get('performance-comparison')
  async getPerformanceComparisonCharts(
    @GetUser() userId: string,
    @Query('plans', CommaSeparatedStringsPipe) trainingPlanTitles: string[],
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    return await this.planComparisonStaticsService.getPerformanceComparison(
      userId,
      trainingPlanTitles,
      eerciseCategories,
    );
  }

  @Get('viewedCategories/:id')
  async getViewedCategories(@GetUser() userId: string, @Param('id') trainingPlanId: string) {
    return await this.recentlyViewedCategoriesService.getViewedCategories(userId, trainingPlanId);
  }

  @Post('viewedCategories/:id')
  async updateViewedCategories(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    return await this.recentlyViewedCategoriesService.updateViewedCategories(userId, trainingPlanId, eerciseCategories);
  }

  @Get(':id/sets')
  async getSetsForCategories(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    return await this.setProgressionService.getSetProgressionByCategories(userId, trainingPlanId, eerciseCategories);
  }

  @Get(':id/performance')
  async getPerformanceCharts(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);
    return this.performanceProgressionService.getPerformanceProgressionByCategories(trainingPlan, eerciseCategories);
  }

  @Get(':id/volume')
  async getTonnageForCategories(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);
    return this.tonnageProgressionService.getTonnageProgressionByCategories(trainingPlan, eerciseCategories);
  }

  @Get(':id/session-durations')
  async getAverageSessionDurationDataForTrainingPlanDay(
    @GetUser() userId: string,
    @Param('id') trainingPlanId: string,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);

    return this.sessionDurationService.calculateAverageDurations(trainingPlan);
  }
}
