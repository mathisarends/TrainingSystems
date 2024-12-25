import { IsEnum, IsNumber } from 'class-validator';

export class UpdateWeightGoalDto {
  @IsEnum(['GAIN', 'LOSE', 'MAINTAIN'], { message: 'weightGoal must be one of GAIN, LOSE, or MAINTAIN' })
  weightGoal: string;

  @IsNumber({}, { message: 'weightGoalRate must be a number' })
  weightGoalRate: number;
}
