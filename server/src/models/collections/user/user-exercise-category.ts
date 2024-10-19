/**
 * Represents the category of an exercise with default settings.
 */
export interface UserExerciseCategory {
  /**
   * The name of the category.
   */
  name: string;

  /**
   * The default pause time between sets in seconds.
   */
  pauseTime: number;

  /**
   * The default number of sets.
   */
  defaultSets: number;

  /**
   * The default number of repetitions per set.
   */
  defaultReps: number;

  /**
   * The default Rate of Perceived Exertion (RPE).
   */
  defaultRPE: number;
}
