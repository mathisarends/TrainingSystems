import { IsBoolean, IsIn, IsNumber } from 'class-validator';

export class AutoProgressionDto {
  @IsBoolean()
  readonly withDeloadWeek: boolean;

  @IsNumber({}, { message: 'rpeProgression must be a number' })
  @IsIn([0.5, 1], { message: 'rpeProgression must be either 0.5 or 1' })
  readonly rpeProgression: 0.5 | 1;
}
