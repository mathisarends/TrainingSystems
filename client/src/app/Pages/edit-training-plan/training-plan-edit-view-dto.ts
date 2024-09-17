import { WeightRecommendationBase } from '../../../types/trainingPlan/weight-recommandation-base';

export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  weightRecommandationBase: WeightRecommendationBase;
  trainingBlockLength: number;
  coverImageBase64: string;
}
