import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sets: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  reps: number;

  @IsOptional()
  weight: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
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
