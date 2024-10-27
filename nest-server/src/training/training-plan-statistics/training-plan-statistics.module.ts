import { forwardRef, Module } from '@nestjs/common';
import { TrainingModule } from '../training.module';
import { TrainingService } from '../training.service';
import { PerformanceProgressionService } from './service/performance-progression.service';
import { PlanComparisonStaticsService } from './service/plan-comparison-statistics.service';
import { RecentlyViewedCategoriesService } from './service/recently-viewed-categories.service';
import { SessionDurationService } from './service/session-duration.service';
import { SetProgressionService } from './service/set-prpgression.service';
import { TonnageProgressionService } from './service/tonnage-progression.service';
import { TrainingStatisticsController } from './training-statistics.controller';

@Module({
  imports: [forwardRef(() => TrainingModule)],
  controllers: [TrainingStatisticsController],
  providers: [
    PlanComparisonStaticsService,
    PerformanceProgressionService,
    RecentlyViewedCategoriesService,
    SetProgressionService,
    SessionDurationService,
    TonnageProgressionService,
    TrainingService,
  ],
})
export class TrainingPlanStatisticsModule {}
