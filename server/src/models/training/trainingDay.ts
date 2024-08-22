import { Exercise } from './exercise.js';

/**
 * Represents a training day, which includes the date and a list of exercises performed.
 */
export interface TrainingDay {
  /**
   * The date of the training day.
   */
  date?: Date;

  /**
   * The total duration of the training session in minutes.
   */
  durationInMinutes?: number;

  /**
   * Holds the timeout ID for tracking inactivity during a session.
   */
  inactivityTimeout?: NodeJS.Timeout;

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
