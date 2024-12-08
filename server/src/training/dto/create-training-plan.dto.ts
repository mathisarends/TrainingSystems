import { ArrayUnique, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsIsoDateString } from 'src/utils/validators/is-iso-date-string.validator';

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

  @IsIsoDateString()
  startDate: string;
}
