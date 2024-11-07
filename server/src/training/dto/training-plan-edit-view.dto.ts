import { WeightRecommendation } from '../model/weight-recommandation.enum';

/**
 * Represents the data structure for editing a training plan.
 *
 * This interface defines the properties required to edit a training plan,
 * including training frequency, weight recommendation settings, and training weeks.
 */
export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingDays: string[];
  weightRecommandationBase: WeightRecommendation;
  trainingBlockLength: number;
  coverImageBase64: string;
}
