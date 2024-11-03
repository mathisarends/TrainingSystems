import { IsBoolean, IsNumber } from 'class-validator';

export class AutoProgressionDto {
  @IsBoolean()
  readonly withDeloadWeek: boolean;

  @IsNumber()
  readonly rpeProgression: 0.5 | 1;
}
