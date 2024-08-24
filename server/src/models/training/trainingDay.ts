import { Exercise } from './exercise.js';

/**
 * Represents a training day, which includes the date and a list of exercises performed.
 */
export interface TrainingDay {
  id: string;

  /**
   * The total duration of the training session in minutes.
   */
  durationInMinutes?: number;

  /**
   * The time when the training session started.
   */
  startTime?: Date;

  /**
   * The time when the training session ended.
   */
  endTime?: Date;

  /**
   * Tracks the duration over which the user makes changes. If changes are not made frequently enough - the Training is interpretd as finisehd
   */
  recording?: boolean;

  /**
   * The list of exercises performed on the training day.
   */
  exercises: Exercise[];
}
