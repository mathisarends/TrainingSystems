import { OmitType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WeightRecommendation } from '../model/weight-recommandation.enum';

/**
 * Represents the data structure for editing a training plan with validation.
 */
export class TrainingPlanDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  trainingFrequency: number;

  @IsEnum(WeightRecommendation)
  weightRecommandationBase: WeightRecommendation;

  @IsNumber()
  trainingBlockLength: number;

  @IsOptional()
  @IsString()
  coverImageBase64?: string;
}

export class CreateTrainingPlanDto extends OmitType(TrainingPlanDto, [
  'id',
] as const) {}
