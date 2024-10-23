import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { User } from 'src/users/user.model';
import { PerformanceProgressionService } from '../service/statistics/performance-progression.service';
import { PlanComparisonStaticsService } from '../service/statistics/plan-comparison-statistics.service';
import { RecentlyViewedCategoriesService } from '../service/statistics/recently-viewed-categories.service';
import { SessionDurationService } from '../service/statistics/session-duration.service';
import { SetProgressionService } from '../service/statistics/set-prpgression.service';
import { TonnageProgressionService } from '../service/statistics/tonnage-progression.service';
import { TrainingService } from '../training.service';
import { CommaSeparatedStringsPipe } from '../utils/comma-seperated-strings.pipe';
import { ExerciseCategoryTypePipe } from '../utils/exercise-category-type.pipe';

// TODO: hier weitermachen (die routen nach und nach implementieren)
@Controller('training-plan/statistics')
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
    @GetUser() user: User,
    @Query('plans', CommaSeparatedStringsPipe) trainingPlanTitles: string[],
    @Query('categories', ExerciseCategoryTypePipe)
    exerciseCategories: ExerciseCategoryType[],
  ) {
    const exerciseCategory = exerciseCategories[0]; // only one category can be compared over multiple plans by now
    return await this.planComparisonStaticsService.getVolumeComparison(
      user.id,
      trainingPlanTitles,
      exerciseCategory,
    );
  }

  @Get('performance-comparison')
  async getPerformanceComparisonCharts(
    @GetUser() user: User,
    @Query('plans', CommaSeparatedStringsPipe) trainingPlanTitles: string[],
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    const exerciseCategory = eerciseCategories[0]; // only one category can be compared over multiple plans by now
    return await this.planComparisonStaticsService.getPerformanceComparison(
      user.id,
      trainingPlanTitles,
      exerciseCategory,
    );
  }

  @Get('viewedCategories/:id')
  async getViewedCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {
    return await this.recentlyViewedCategoriesService.getViewedCategories(
      user.id,
      trainingPlanId,
    );
  }

  @Post('viewedCategories/:id')
  async updateViewedCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    return await this.recentlyViewedCategoriesService.updateViewedCategories(
      user.id,
      trainingPlanId,
      eerciseCategories,
    );
  }

  @Get(':id/sets')
  async getSetsForCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    return await this.setProgressionService.getSetProgressionByCategories(
      user.id,
      trainingPlanId,
      eerciseCategories,
    );
  }

  @Get(':id/performance')
  async getPerformanceCharts(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      user.id,
      trainingPlanId,
    );
    return this.performanceProgressionService.getPerformanceProgressionByCategories(
      trainingPlan,
      eerciseCategories,
    );
  }

  @Get(':id/volume')
  async getTonnageForCategories(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
    @Query('categories', ExerciseCategoryTypePipe)
    eerciseCategories: ExerciseCategoryType[],
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      user.id,
      trainingPlanId,
    );
    return this.tonnageProgressionService.getTonnageProgressionByCategories(
      trainingPlan,
      eerciseCategories,
    );
  }

  @Get(':id/session-durations')
  async getAverageSessionDurationDataForTrainingPlanDay(
    @GetUser() user: User,
    @Param('id') trainingPlanId: string,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      user.id,
      trainingPlanId,
    );

    return this.sessionDurationService.calculateAverageDurations(trainingPlan);
  }
}
