import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTrainingPlanDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  trainingFrequency: number;

  @IsNumber()
  trainingBlockLength: number;

  @IsOptional()
  @IsString()
  coverImageBase64?: string;
}
