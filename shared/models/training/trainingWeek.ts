import { TrainingDay } from './trainingDay.js';

/**
 * Represents a training week, which includes multiple training days and statistics for specific exercises.
 */
export interface TrainingWeek {
  /**
   * The list of training days in the week.
   */
  trainingDays: TrainingDay[];

  /**
   * The total number of squat sets done during the week.
   */
  squatSetsDone: number;

  /**
   * The total weight lifted for squats during the week.
   */
  squatTonnage: number;

  /**
   * The total number of bench press sets done during the week.
   */
  benchSetsDone: number;

  /**
   * The total weight lifted for bench press during the week.
   */
  benchTonnage: number;

  /**
   * The total number of deadlift sets done during the week.
   */
  deadliftSetsDone: number;

  /**
   * The total weight lifted for deadlifts during the week.
   */
  deadliftTonnage: number;
}
