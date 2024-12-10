import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingDayExerciseDto } from '../training-plan-view/dto/training-day-exercise.dto';

/**
 * DTO for validating and transferring the rearrangement of Exercise data.
 */
export class TrainingDayExercisesRearrangementDto {
  @ValidateNested({ each: true })
  @Type(() => TrainingDayExerciseDto)
  exercises: TrainingDayExerciseDto[];
}
