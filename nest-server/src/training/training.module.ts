import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TrainingPlanEditController } from './controller/training-plan-edit.controller';
import { TrainingStatisticsController } from './controller/training-statistics.controller';
import { TrainingTimerController } from './controller/training-timer.controller';
import { TrainingController } from './controller/training.controller';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.model';
import { AutoProgressionService } from './service/auto-progression.service';
import { CreateTrainingPlanService } from './service/create-training-plan.service';
import { EditTrainingPlanService } from './service/edit-training-plan.service';
import { RestTimerKeepAliveService } from './service/rest-timer/rest-timer-keep-alive.service';
import { PerformanceProgressionService } from './service/statistics/performance-progression.service';
import { PlanComparisonStaticsService } from './service/statistics/plan-comparison-statistics.service';
import { RecentlyViewedCategoriesService } from './service/statistics/recently-viewed-categories.service';
import { SessionDurationService } from './service/statistics/session-duration.service';
import { SetProgressionService } from './service/statistics/set-prpgression.service';
import { TonnageProgressionService } from './service/statistics/tonnage-progression.service';
import { TrainingPlanCardViewService } from './service/training-plan-card-view.service';
import { TrainingPlanUtilsService } from './service/training-plan-utils.service';
import { TrainingPlanViewValidationService } from './service/training-plan-view-validation.service';
import { TrainingPlanViewModule } from './training-plan-view/training-plan-view.module';
import { TrainingService } from './training.service';

// TODO: aufteilen in trainingModule, trianingPlanModule, statisticsModule und timer Module
// https://chatgpt.com/g/g-M5xiZJST7-nestjs-copilot/c/671a74bd-528c-8002-8936-14b871d46fa0

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
    ]),
    ExerciseModule,
    PushNotificationsModule,
    UsersModule,
    TrainingPlanViewModule,
  ],
  controllers: [
    TrainingController,
    TrainingPlanEditController,
    TrainingStatisticsController,
    TrainingTimerController,
  ],
  providers: [
    TrainingPlanUtilsService,
    CreateTrainingPlanService,
    TrainingPlanCardViewService,
    EditTrainingPlanService,

    TrainingPlanViewValidationService,
    PlanComparisonStaticsService,
    PerformanceProgressionService,
    RecentlyViewedCategoriesService,
    SetProgressionService,
    SessionDurationService,
    TrainingService,
    PushNotificationsService,
    TonnageProgressionService,
    RestTimerKeepAliveService,
    AutoProgressionService,
    UsersService,
  ],
  exports: [TrainingService, TrainingPlanViewValidationService, MongooseModule],
})
export class TrainingModule {}
