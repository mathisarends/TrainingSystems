import { TrainingDay } from './trainingDay';

/**
 * Represents a training week, which includes multiple training days and statistics for specific exercises.
 */
export interface TrainingWeek {
  /**
   * The list of training days in the week.
   */
  trainingDays: TrainingDay[];
}
