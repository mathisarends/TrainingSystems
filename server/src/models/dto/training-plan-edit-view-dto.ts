import { WeightRecommendationBase } from '../training/weight-recommandation.enum.js';
import { TrainingWeek } from '../training/trainingWeek.js';

/**
 * Represents the data structure for editing a training plan.
 *
 * This interface defines the properties required to edit a training plan,
 * including training frequency, weight recommendation settings, and training weeks.
 */
export interface TrainingPlanEditViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  weightRecommandationBase: WeightRecommendationBase;
  trainingWeeks: TrainingWeek[];
  coverImageBase64: string;
}
