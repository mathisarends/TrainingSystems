import { TrainingDay } from '../model/training-day.schema';

export interface TrainingDayViewDto {
  title: string;
  trainingFrequency: number;
  trainingBlockLength: number;
  trainingDay: TrainingDay;
  weightRecommendations: string[];
}
