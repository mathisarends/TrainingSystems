import { TrainingWeek } from '../../../types/trainingPlan/trainingWeek';
import { WeightRecommendationBase } from '../../../types/trainingPlan/weight-recommandation-base';

export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  weightRecommandationBase: WeightRecommendationBase;
  trainingWeeks: TrainingWeek[];
  coverImageBase64: string;
}
