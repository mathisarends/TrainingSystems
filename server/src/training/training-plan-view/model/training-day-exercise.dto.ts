import { IsNotEmpty } from 'class-validator';
import { Exercise } from 'src/training/model/exercise.schema';

export class TrainingDayExerciseDto {
  @IsNotEmpty()
  exercise: Exercise;
}
