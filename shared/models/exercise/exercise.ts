import { ExerciseCategory } from "./exerciseCategory.js";
/**
 * Represents an exercise with its associated details.
 */
export interface Exercise {
  /**
   * The name of the exercise.
   */
  name: string;

  /**
   * A factor used to calculate the maximum weight for the exercise.
   * This is optional and defaults to 1 if not provided.
   */
  maxFactor?: number;

  /**
   * The category details for the exercise.
   */
  category: ExerciseCategory;
}
