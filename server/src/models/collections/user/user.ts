/* Autor: Mathis Kristoffer Arends */
import { Entity } from '../entity.js';
import { UserExercise } from './user-exercise.js';
import { TrainingPlan } from '../../training/trainingPlan.js';

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

  /**
   * Shows whether the navigation tutorial at the training page was completed
   */
  navigationLectureComplete?: boolean;

  placeholderExercises: UserExercise[];
  squatExercises: UserExercise[];
  benchExercises: UserExercise[];
  deadliftExercises: UserExercise[];
  overheadpressExercises: UserExercise[];
  chestExercises: UserExercise[];
  backExercises: UserExercise[];
  shoulderExercises: UserExercise[];
  tricepsExercises: UserExercise[];
  bicepsExercises: UserExercise[];
  legExercises: UserExercise[];
}
