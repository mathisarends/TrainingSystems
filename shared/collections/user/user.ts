/* Autor: Mathis Kristoffer Arends */
import { Entity } from "../entity.js";
import { UserExercise } from "./user-exercise.js";
import { TrainingPlan } from "../../training/trainingPlan.js";
import { ExerciseCategoryType } from "../../training/exercise-category-type.js";
import { TrainingDAyFinishedNotification } from "./training-fninished-notifcation.js";

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
   * The Gym-Ticket for the user.
   */
  gymtTicket: string;

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
   * A record of exercises categorized by exercise type.
   *
   * This property is required and holds a mapping between `ExerciseCategoryType`
   * and arrays of `UserExercise` objects. It organizes the user's exercises by category.
   */
  exercises: Record<ExerciseCategoryType, UserExercise[]>;

  /**
   * Shows information about the user's previous training session, such as duration.
   *
   * This property is required and holds an array with  `TrainingDay` objects,
   * representing the summary of the user's previous training day.
   */
  trainingDayNotifications: TrainingDAyFinishedNotification[];
}
