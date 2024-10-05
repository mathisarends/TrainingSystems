import { TrainingDay } from '../../../models/training/trainingDay.js';

export interface TrainingDayDto {
  title: string;
  trainingFrequency: number;
  trainingBlockLength: number;
  trainingDay: TrainingDay;
  weightRecommandations: string[];
}
