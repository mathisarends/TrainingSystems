import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { TrainingPlanEditController } from './controller/training-plan-edit.controller';
import { TrainingPlanViewController } from './controller/training-plan-view.controller';
import { TrainingController } from './controller/training.controller';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.schema';
import { CreateTrainingPlanService } from './service/create-training-plan.service';
import { EditTrainingPlanService } from './service/edit-training-plan.service';
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
  ],
  providers: [
    TrainingPlanUtilsService,
    CreateTrainingPlanService,
    TrainingPlanCardViewService,
    EditTrainingPlanService,
    TrainingPlanViewService,
    TrainingPlanViewUpdateService,
    TrainingPlanViewValidationService,
    TrainingService,
    PushNotificationsService,
    TrainingSessionManagerService,
    TonnageProgressionService,
    TrainingSessionTracker,
  ],
})
export class TrainingModule {}
