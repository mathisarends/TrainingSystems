import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTrainingPlanDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayUnique()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  trainingDays: string[];

  @IsNumber()
  trainingBlockLength: number;

  @IsOptional()
  @IsString()
  coverImageBase64?: string;
}
