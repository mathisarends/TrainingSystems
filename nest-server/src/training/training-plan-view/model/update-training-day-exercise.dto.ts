import { IsNotEmpty, IsOptional } from 'class-validator';
import { Exercise } from 'src/training/model/exercise.schema';

export class UpdateTrainingDayExerciseDto {
  @IsNotEmpty()
  exercise: Exercise;

  @IsOptional()
  _id?: string;
}
