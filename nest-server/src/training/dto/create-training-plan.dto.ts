import { OmitType } from '@nestjs/mapped-types';
import { TrainingPlanDto } from './training-plan.dto';

export class CreateTrainingPlanDto extends OmitType(TrainingPlanDto, [
  'id',
] as const) {}
