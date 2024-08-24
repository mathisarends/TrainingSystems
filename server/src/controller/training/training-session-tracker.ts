import { TrainingDay } from '../../models/training/trainingDay.js';

export class TrainingSessionTracker {
  trainingDay: TrainingDay;
  private inactivityTimeoutDuration: number = 10 * 1000; // 10 seconds for testing
  private inactivityTimeoutId: NodeJS.Timeout | null = null;
  private onTimeoutCallback: () => Promise<void>; // Callback to notify manager on timeout

  constructor(trainingDay: TrainingDay, onTimeoutCallback: () => Promise<void>) {
    this.trainingDay = trainingDay;
    this.onTimeoutCallback = onTimeoutCallback;
  }

  /**
   * Handles activity signals that should reset the inactivity timeout and start recording if not already started.
   */
  public handleActivitySignal(): void {
    console.log('Activity detected');

    if (!this.trainingDay.recording) {
      this.startRecording();
    }

    this.resetInactivityTimeout(); // Clear and reset the inactivity timeout
  }

  /**
   * Cleans up resources associated with this tracker.
   */
  public cleanup(): void {
    this.clearInactivityTimeout();
  }

  /**
   * Determines if a field name is associated with an activity signal.
   *
   * @param fieldName - The field name to check.
   * @returns True if the field indicates an activity signal; otherwise, false.
   */
  public isActivitySignal(fieldName: string): boolean {
    return fieldName.endsWith('weight') || fieldName.endsWith('actualRPE');
  }

  /**
   * Starts the recording of a training session.
   */
  private startRecording(): void {
    this.trainingDay.startTime = new Date();
    this.trainingDay.recording = true;
    console.log('Recording started');

    this.scheduleInactivityTimeout();
  }

  /**
   * Stops the recording of a training session and calculates the duration.
   */
  private stopRecording(): void {
    this.trainingDay.endTime = new Date();
    this.trainingDay.recording = false;
    this.calculateSessionDuration();
    this.clearInactivityTimeout();

    console.log('Training session stopped:', this.trainingDay);

    // Notify the manager or any other part of the application
    this.onTimeoutCallback();
  }

  /**
   * Resets the inactivity timeout for a training session.
   */
  private resetInactivityTimeout(): void {
    console.log('Resetting inactivity timeout');
    this.clearInactivityTimeout(); // Clear any existing timeout
    this.scheduleInactivityTimeout(); // Schedule a new timeout
  }

  /**
   * Schedules the inactivity timeout.
   */
  private scheduleInactivityTimeout(): void {
    this.inactivityTimeoutId = setTimeout(() => this.stopRecording(), this.inactivityTimeoutDuration);
    console.log('Inactivity timeout scheduled for:', this.inactivityTimeoutDuration / 1000, 'seconds');
  }

  /**
   * Clears the inactivity timeout if set.
   */
  private clearInactivityTimeout(): void {
    if (this.inactivityTimeoutId) {
      console.log('Clearing existing inactivity timeout');
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }
  }

  /**
   * Calculates the duration of the training session.
   */
  private calculateSessionDuration(): void {
    if (this.trainingDay.startTime && this.trainingDay.endTime) {
      const duration = (this.trainingDay.endTime.getTime() - this.trainingDay.startTime.getTime()) / 60000; // Convert to minutes
      this.trainingDay.durationInMinutes = Math.max(duration, 0);
      console.log('Session duration calculated:', this.trainingDay.durationInMinutes, 'minutes');
    }
  }
}
