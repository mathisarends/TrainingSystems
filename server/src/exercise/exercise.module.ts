import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseUpdateService } from './exercise-update.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Exercise, ExerciseSchema } from './model/exercise.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Exercise.name, schema: ExerciseSchema }])],
  controllers: [ExerciseController],
  providers: [ExerciseService, ExerciseUpdateService],
  exports: [ExerciseService, MongooseModule],
})
export class ExerciseModule {}
