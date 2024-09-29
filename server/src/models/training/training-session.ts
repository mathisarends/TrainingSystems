import { Exercise } from './exercise.js';
import { TrainingPlan } from './trainingPlan.js';

/**
 * Interface representing a training session, derived from TrainingPlan but without trainingWeeks.
 */
export interface TrainingSession extends Omit<TrainingPlan, 'trainingWeeks'> {
  /**
   * The exercises included in the training session.
   */
  exercises: Exercise[];
}
