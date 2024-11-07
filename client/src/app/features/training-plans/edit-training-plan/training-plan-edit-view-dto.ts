export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingDays: string[];
  weightRecommandationBase: WeightRecommendationBase;
  trainingBlockLength: number;
  coverImageBase64: string;
}

/**
 * Enum for weight recommendation base.
 */
export enum WeightRecommendationBase {
  LASTWEEK = 'lastWeek',
  OFF = 'off',
}
