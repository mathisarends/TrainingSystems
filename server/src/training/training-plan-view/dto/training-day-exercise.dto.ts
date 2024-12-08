import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

/**
 * DTO for validating and transferring Exercise data.
 */
export class TrainingDayExerciseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  exercise: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sets: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  reps: number;

  @IsNotEmpty()
  @IsString()
  @IsPositive()
  weight: string;

  @IsNotEmpty()
  @IsString()
  targetRPE: number;

  @IsOptional()
  @IsString()
  actualRPE: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  estMax?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
