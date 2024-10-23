import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { TrainingPlanEditController } from './controller/training-plan-edit.controller';
import { TrainingPlanViewController } from './controller/training-plan-view.controller';
import { TrainingStatisticsController } from './controller/training-statistics.controller';
import { TrainingController } from './controller/training.controller';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.schema';
import { CreateTrainingPlanService } from './service/create-training-plan.service';
import { EditTrainingPlanService } from './service/edit-training-plan.service';
import { PerformanceProgressionService } from './service/statistics/performance-progression.service';
import { PlanComparisonStaticsService } from './service/statistics/plan-comparison-statistics.service';
import { RecentlyViewedCategoriesService } from './service/statistics/recently-viewed-categories.service';
import { SessionDurationService } from './service/statistics/session-duration.service';
import { SetProgressionService } from './service/statistics/set-prpgression.service';
import { TonnageProgressionService } from './service/statistics/tonnage-progression.service';
import { TrainingPlanCardViewService } from './service/training-plan-card-view.service';
import { TrainingPlanUtilsService } from './service/training-plan-utils.service';
import { TrainingPlanViewUpdateService } from './service/training-plan-view-update.service';
import { TrainingPlanViewValidationService } from './service/training-plan-view-validation.service';
import { TrainingPlanViewService } from './service/training-plan-view.service';
import { TrainingSessionManagerService } from './service/training-view/training-session-manager.service';
import { TrainingSessionTracker } from './service/training-view/training-session-tracker.service';
import { TrainingService } from './training.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
    ]),
    PushNotificationsModule,
  ],
  controllers: [
    TrainingController,
    TrainingPlanEditController,
    TrainingPlanViewController,
    TrainingStatisticsController,
  ],
  providers: [
    TrainingPlanUtilsService,
    CreateTrainingPlanService,
    TrainingPlanCardViewService,
    EditTrainingPlanService,
    TrainingPlanViewService,
    TrainingPlanViewUpdateService,
    TrainingPlanViewValidationService,
    PlanComparisonStaticsService,
    PerformanceProgressionService,
    RecentlyViewedCategoriesService,
    SetProgressionService,
    SessionDurationService,
    TrainingService,
    PushNotificationsService,
    TrainingSessionManagerService,
    TonnageProgressionService,
    TrainingSessionTracker,
  ],
})
export class TrainingModule {}
