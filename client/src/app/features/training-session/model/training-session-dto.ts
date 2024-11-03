import { TrainingDay } from '../../training-plans/training-view/training-day.js';

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

  versions: TrainingDay[];

  /**
   * The BASE-64 encoded coverImage of the training plan.
   */
  coverImageBase64: string;

  recentlyViewedCategoriesInStatisticSection?: string[];
}
