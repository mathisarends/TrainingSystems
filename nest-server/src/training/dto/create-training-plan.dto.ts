import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WeightRecommendation } from '../model/weight-recommandation.enum';

export class CreateTrainingPlanDto {
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
