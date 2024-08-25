import { TrainingDayIndexes } from './training-day-indexes';

export interface TrainingPlanCardView {
  id: string;
  title: string;
  trainingFrequency: number;
  lastUpdated: string;
  coverImageBase64?: string;
  pictureUrl?: string; // profile picture of user
  percentageFinished: number;
  averageTrainingDayDuration?: number;
}
