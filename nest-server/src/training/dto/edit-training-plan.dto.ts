import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingPlanDto } from './create-training-plan.dto';

export class EditTrainingPlanDto extends PartialType(CreateTrainingPlanDto) {}
