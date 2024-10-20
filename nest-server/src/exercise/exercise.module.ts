import { Module } from '@nestjs/common';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  controllers: [ExerciseController],
  providers: [ExerciseService, ExerciseUpdateService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
