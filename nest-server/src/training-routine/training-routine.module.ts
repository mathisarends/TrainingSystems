import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseService } from 'src/exercise/exercise.service';
import { PushNotificationsModule } from 'src/push-notifications/push-notifications.module';
import { TrainingPlanViewModule } from 'src/training/training-plan-view/training-plan-view.module';
import { TrainingSessionManagerService } from 'src/training/training-plan-view/training-session-manager.service';
import { TrainingSessionTracker } from 'src/training/training-plan-view/training-session-tracker.service';
import { TrainingModule } from 'src/training/training.module';
import { TrainingService } from 'src/training/training.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import {
  TrainingRoutine,
  TrainingRoutineSchema,
} from './model/training-routine.model';
import { TrainingRoutineViewService } from './training-routine-view.service';
import { TrainingRoutineController } from './training-routine.controller';
import { TrainingRoutineService } from './training-routine.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingRoutine.name, schema: TrainingRoutineSchema },
    ]),
    TrainingPlanViewModule,
    PushNotificationsModule,
    TrainingModule,
    UsersModule,
  ],
  controllers: [TrainingRoutineController],
  providers: [
    TrainingService,
    TrainingRoutineService,
    TrainingRoutineViewService,
    UsersService,
    ExerciseService,
    TrainingSessionManagerService,
    TrainingSessionTracker,
  ],
})
export class TrainingRoutineModule {}
