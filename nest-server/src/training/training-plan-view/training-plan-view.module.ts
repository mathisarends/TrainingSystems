import { forwardRef, Module } from '@nestjs/common';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';
import { UserExerciseRecordModule } from 'src/user-exercise-record/user-exercise-record.module';
import { UserExerciseRecordService } from 'src/user-exercise-record/user-exercise-record.service';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingModule } from '../training.module';
import { TrainingPlanViewUpdateService } from './training-plan-view-update.service';
import { TrainingPlanViewController } from './training-plan-view.controller';
import { TrainingPlanViewService } from './training-plan-view.service';
import { TrainingSessionManagerService } from './training-session-manager.service';
import { TrainingSessionTracker } from './training-session-tracker.service';
import { TrainingPlanViewUpdateService2 } from './training-view-update-2.service';

@Module({
  imports: [
    forwardRef(() => TrainingModule),
    PushNotificationsModule,
    UserExerciseRecordModule,
  ],
  controllers: [TrainingPlanViewController],
  providers: [
    TrainingPlanViewService,
    TrainingPlanViewUpdateService,
    TrainingPlanViewValidationService,
    TrainingSessionTracker,
    TrainingSessionManagerService,
    UserExerciseRecordService,
    TrainingPlanViewUpdateService2,
  ],
  exports: [TrainingSessionManagerService, TrainingSessionTracker],
})
export class TrainingPlanViewModule {}
