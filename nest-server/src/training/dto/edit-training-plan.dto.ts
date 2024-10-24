import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateTrainingPlanDto } from './create-training-plan.dto';

export class EditTrainingPlanDto extends PartialType(CreateTrainingPlanDto) {
  @IsString()
  @IsNotEmpty()
  id: string;
}
