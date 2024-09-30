import { Percentage } from '../../../../../shared/components/percentage-circle-visualisation/percentage.type';

enum WeightRecommendationBase {
  LASTWEEK = 'lastWeek',
  OFF = 'off',
}

export interface TrainingPlanCardView {
  id: string;
  title: string;
  trainingFrequency?: number;
  blockLength?: number;
  weightRecomamndationBase?: WeightRecommendationBase;
  lastUpdated: Date;
  pictureUrl?: string;
  coverImageBase64?: string;
  percentageFinished?: Percentage;
  averageTrainingDayDuration?: string;
}
