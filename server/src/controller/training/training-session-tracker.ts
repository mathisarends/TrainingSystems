import { Exercise } from '../../models/training/exercise.js';
import { TrainingDay } from '../../models/training/trainingDay.js';

/**
 * The `TrainingSessionTracker` class is responsible for managing a user's training session.
 * It tracks the start and stop times, handles activity signals, manages exercise data,
 * and automatically stops the session after a period of inactivity (25 minutes by default).
 */
export class TrainingSessionTracker {
  private trainingDay: TrainingDay;
  private inactivityTimeoutId: NodeJS.Timeout | null = null;
  private onTimeoutCallback: () => Promise<void>;

  private readonly inactivityTimeoutDuration: number = 10 * 1000;

  constructor(trainingDay: TrainingDay, onTimeoutCallback: () => Promise<void>) {
    this.trainingDay = trainingDay;
    this.onTimeoutCallback = onTimeoutCallback;
  }

  /**
   * Handles activity signals to either start recording a session or reset the inactivity timeout.
   * If the session is not already recording, it starts the session. Otherwise, it resets the inactivity timeout.
   */
  handleActivitySignal(): void {
    if (!this.trainingDay.recording) {
      this.startRecording();
    } else {
      this.resetInactivityTimeout();
    }
  }

  /**
   * Updates the exercise data for the current training day.
   * @param exercises - An array of `Exercise` objects representing the updated exercise data.
   */
  updateTrainingDayExerciseData(exercises: Exercise[]) {
    this.trainingDay.exercises = exercises;
  }

  /**
   * Returns the current `TrainingDay` object being tracked.
   * @returns The `TrainingDay` object.
   */
  getTrainingDay() {
    return this.trainingDay;
  }

  /**
   * Cleans up resources associated with this tracker, including clearing the inactivity timeout.
   */
  cleanup(): void {
    this.clearInactivityTimeout();
  }

  /**
   * Determines if a field name and its value represent an activity signal.
   * An activity signal is identified by field names ending with 'weight' or 'actualRPE' that have non-empty values.
   * @param fieldName - The field name to check.
   * @param fieldValue - The field value to check.
   * @returns True if the field represents an activity signal; otherwise, false.
   */
  isActivitySignal(fieldName: string, fieldValue: string): boolean {
    return (fieldName.endsWith('weight') && !!fieldValue) || (fieldName.endsWith('actualRPE') && !!fieldValue);
  }

  /**
   * Starts the recording of a training session by setting the start time and enabling recording.
   * Schedules the inactivity timeout to automatically stop the session if no activity occurs.
   */
  private startRecording(): void {
    this.trainingDay.startTime = new Date();
    this.trainingDay.recording = true;

    this.scheduleInactivityTimeout();
  }

  /**
   * Stops the recording of a training session, calculates the session duration,
   * clears the inactivity timeout, and executes the timeout callback.
   */
  private stopRecording(): void {
    this.trainingDay.endTime = new Date();
    this.trainingDay.recording = false;
    this.calculateAndSetSessionDuration();
    this.clearInactivityTimeout();

    this.onTimeoutCallback();
  }

  /**
   * Resets the inactivity timeout for the training session.
   * This is typically called when activity is detected to prevent the session from timing out.
   */
  private resetInactivityTimeout(): void {
    this.clearInactivityTimeout();
    this.scheduleInactivityTimeout();
  }

  /**
   * Schedules the inactivity timeout to automatically stop the session after a period of inactivity.
   */
  private scheduleInactivityTimeout(): void {
    this.inactivityTimeoutId = setTimeout(() => this.stopRecording(), this.inactivityTimeoutDuration);
  }

  /**
   * Clears the currently scheduled inactivity timeout, if any.
   */
  private clearInactivityTimeout(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }
  }

  /**
   * Calculates the duration of the training session in minutes and stores it in the `TrainingDay` object.
   */
  private calculateAndSetSessionDuration(): void {
    if (this.trainingDay.startTime && this.trainingDay.endTime) {
      const duration =
        (this.trainingDay.endTime.getTime() - this.trainingDay.startTime.getTime() - this.inactivityTimeoutDuration) /
        60000;

      this.trainingDay.durationInMinutes = Math.max(duration, 0);
    }
  }
}
