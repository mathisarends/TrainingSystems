import { WeightRecommendationBase } from '../training/weight-recommandation.enum.js';
import { TrainingWeek } from '../training/trainingWeek.js';

export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  weightRecommandationBase: WeightRecommendationBase;
  trainingWeeks: TrainingWeek[];
  coverImageBase64: string;
}
