import { BodyWeightGoal } from '../body-weight-goal.enum';

export interface BodyWeightConfigurationDto {
  weightGoal: BodyWeightGoal;
  weightGoalRate: number;
}
