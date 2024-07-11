import { TrainingWeek } from "./trainingWeek.js";
import { TrainingPhase } from "./enum/trainingPhase.js";
import { WeightRecommendationBase } from "./enum/weightRecommandationBase.js";

/**
 * Interface representing a training plan.
 */
export interface TrainingPlan {
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
   * Indicates whether automatic progression is enabled.
   */
  automaticProgressionEnabled?: boolean;

  /**
   * Indicates whether a deload is enabled for the last week of the training plan.
   */
  lastWeekDeloadEnabled?: boolean;

  /**
   * The base for weight recommendations, can be 'max', 'lastWeek', or 'off'.
   */
  weightRecommandationBase: WeightRecommendationBase;

  /**
   * An array of training weeks included in the training plan.
   */
  trainingWeeks: TrainingWeek[];
}
