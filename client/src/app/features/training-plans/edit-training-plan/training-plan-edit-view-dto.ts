export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  weightRecommandationBase: WeightRecommendationBase;
  trainingBlockLength: number;
  coverImageBase64: string;

  referencePlanId?: string;
}

/**
 * Enum for weight recommendation base.
 */
export enum WeightRecommendationBase {
  LASTWEEK = 'lastWeek',
  OFF = 'off',
}
