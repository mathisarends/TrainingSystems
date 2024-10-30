import { IsMongoId, IsNotEmpty } from '@nestjs/class-validator';
import { CreateTrainingRoutineDto } from './create-training-routine.dto';

export class EditTrainingRoutineDto extends CreateTrainingRoutineDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
