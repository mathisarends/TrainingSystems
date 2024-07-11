/* Autor: Mathis Kristoffer Arends */
import { Entity } from './entity.js';
import { Exercise } from './exercise/exercise.js';
import { TrainingPlan } from './training/trainingPlan.js';

/**
 * Represents a user with authentication details.
 *
 * @extends Entity
 */
export interface User extends Entity {
  /**
   * The username of the user.
   */
  username: string;

  /**
   * The email address of the user.
   */
  email: string;

  /**
   * The URL of the user's profile picture.
   * This field is optional.
   */
  pictureUrl?: string;

  /**
   * The password of the user.
   * This field is optional and may not be required if logged in with Google.
   */
  password?: string;

  /**
   * The list of training plans associated with the user.
   */
  trainingPlans: TrainingPlan[];

  placeholderExercises: Exercise[];
  squatExercises: Exercise[];
  benchExercises: Exercise[];
  deadliftExercises: Exercise[];
  overheadpressExercises: Exercise[];
  chestExercises: Exercise[];
  backExercises: Exercise[];
  shoulderExercises: Exercise[];
  tricepsExercises: Exercise[];
  bicepsExercises: Exercise[];
  legExercises: Exercise[];
}
