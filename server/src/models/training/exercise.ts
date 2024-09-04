/**
 * Represents an exercise within a workout routine.
 */
export interface Exercise {
  /**
   * The category or type of the exercise (e.g., strength, cardio).
   */
  category: string;

  /**
   * The name of the exercise.
   */
  exercise: string;

  /**
   * The number of sets to be performed.
   */
  sets: number;

  /**
   * The number of repetitions per set.
   */
  reps: number;

  /**
   * The weight to be used for the exercise (can be a string to accommodate different units).
   */
  weight: string;

  /**
   * The target Rate of Perceived Exertion (RPE) for the exercise.
   */
  targetRPE: string;

  /**
   * The actual Rate of Perceived Exertion (RPE) experienced during the exercise.
   */
  actualRPE: string;

  /**
   * The estimated maximum weight that can be lifted for one repetition (1RM).
   */
  estMax: number;

  /**
   * Notes associated with the current day
   */
  notes?: string;
}
