import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseService } from 'src/exercise/exercise.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import {
  TrainingRoutine,
  TrainingRoutineSchema,
} from './model/training-routine.model';
import { TrainingRoutineController } from './training-routine.controller';
import { TrainingRoutineService } from './training-routine.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingRoutine.name, schema: TrainingRoutineSchema },
    ]),
    UsersModule,
  ],
  controllers: [TrainingRoutineController],
  providers: [TrainingRoutineService, UsersService, ExerciseService],
})
export class TrainingRoutineModule {}
