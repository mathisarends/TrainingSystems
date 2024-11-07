import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WeightRecommendation } from 'src/training/model/weight-recommandation.enum';

export class CreateTrainingRoutineDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(WeightRecommendation)
  weightRecommandationBase: WeightRecommendation;

  @IsOptional()
  @IsString()
  coverImageBase64?: string;
}
