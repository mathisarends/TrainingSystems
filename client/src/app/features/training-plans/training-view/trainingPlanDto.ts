import { TrainingDay } from './training-day';

// TODO: das hier ist keine training plan sondern eine training day meta data dto oder so.
export interface TrainingPlanDto {
  title: string;
  trainingFrequency: number;
  trainingBlockLength: number;
  trainingDay: TrainingDay;
  weightRecommandations: string[];
}
