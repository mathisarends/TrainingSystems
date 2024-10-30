import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  controllers: [TrainingRoutineController],
  providers: [TrainingRoutineService],
})
export class TrainingRoutineModule {}
