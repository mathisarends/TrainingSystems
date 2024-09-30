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
  percentageFinished?: number;
  averageTrainingDayDuration?: string;
}
