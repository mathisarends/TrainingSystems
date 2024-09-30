import { WeightRecommendationBase } from '../../training-plans/edit-training-plan/training-plan-edit-view-dto.js';
import { Exercise } from '../../training-plans/training-view/training-exercise.js';

/**
 * Interface representing a training plan.
 */
export interface TrainingSessionDto {
  /**
   * The unique id for the training plan.
   */
  id: string;

  /**
   * The title of the training plan.
   */
  title: string;

  /**
   * The date when the training plan was last updated.
   */
  lastUpdated: Date;

  /**
   * The base for weight recommendations, can be 'max', 'lastWeek', or 'off'.
   */
  weightRecommandationBase: WeightRecommendationBase;

  trainingDays: Exercise[];

  /**
   * The BASE-64 encoded coverImage of the training plan.
   */
  coverImageBase64?: string;

  recentlyViewedCategoriesInStatisticSection?: string[];
}
