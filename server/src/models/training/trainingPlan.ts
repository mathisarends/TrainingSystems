import { TrainingWeek } from './trainingWeek.js';
import { WeightRecommendationBase } from './weight-recommandation.enum.js';

/**
 * Interface representing a training plan.
 */
export interface TrainingPlan {
  /**
   * The unique id for the training plan.
   */
  id: string;

  /**
   * The title of the training plan.
   */
  title: string;

  /**
   * The frequency of training sessions per week.
   */
  trainingFrequency: number;

  /**
   * The date when the training plan was last updated.
   */
  lastUpdated: Date;

  /**
   * The base for weight recommendations, can be 'max', 'lastWeek', or 'off'.
   */
  weightRecommandationBase: WeightRecommendationBase;

  /**
   * An array of training weeks included in the training plan.
   */
  trainingWeeks: TrainingWeek[];

  /**
   * The BASE-64 encoded coverImage of the training plan.
   */
  coverImageBase64?: string;

  recentlyViewedCategoriesInStatisticSection?: string[];
}
