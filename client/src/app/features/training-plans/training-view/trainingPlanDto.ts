import { TrainingDay } from './training-day';

export interface TrainingPlanDto {
  title: string;
  trainingFrequency: number;
  trainingBlockLength: number;
  trainingDay: Partial<TrainingDay>;
  weightRecommandations: string[];
}
