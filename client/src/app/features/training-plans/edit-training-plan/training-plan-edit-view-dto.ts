export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  weightRecommandationBase: WeightRecommendationBase;
  trainingBlockLength: number;
  coverImageBase64: string;
}

/**
 * Enum for weight recommendation base.
 */
enum WeightRecommendationBase {
  LASTWEEK = 'lastWeek',
  OFF = 'off',
}
