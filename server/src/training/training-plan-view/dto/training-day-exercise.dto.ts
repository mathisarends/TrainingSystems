import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO for validating and transferring Exercise data.
 */
export class TrainingDayExerciseDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  exercise: string;

  @IsOptional()
  @IsNumber()
  sets: number;

  @IsOptional()
  @IsNumber()
  reps: number;

  @IsString()
  @IsOptional()
  weight: string;

  @IsOptional()
  @IsNumber()
  targetRPE: number;

  @IsOptional()
  actualRPE?: string;

  @IsOptional()
  @IsNumber()
  estMax?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
