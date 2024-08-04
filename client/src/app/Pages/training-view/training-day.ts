import { Exercise } from './training-exercise';

/**
s * Represents a training day, which includes the date and a list of exercises performed.
 */
export interface TrainingDay {
  /**
   * The date of the training day.
   */
  date?: Date;

  /**
   * The list of exercises performed on the training day.
   */
  exercises: Exercise[];
}
