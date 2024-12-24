import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class BodyWeightEntryDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
}
