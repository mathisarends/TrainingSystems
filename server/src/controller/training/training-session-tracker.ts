import { TrainingDay } from '../../models/training/trainingDay.js';

export class TrainingSessionTracker {
  private inactivityTimeoutDuration: number = 25 * 60 * 1000;
  private inactivityTimeoutId: NodeJS.Timeout | null = null;
  private trainingDay: TrainingDay;

  constructor(trainingDay: TrainingDay) {
    this.trainingDay = trainingDay;
  }

  /**
   * Handles activity signals that should reset the inactivity timeout and start recording if not already started.
   */
  public handleActivitySignal(): void {
    if (!this.trainingDay.recording) {
      this.startRecording();
    }
    this.resetInactivityTimeout();
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
  }

  /**
   * Resets the inactivity timeout for a training session.
   */
  private resetInactivityTimeout(): void {
    this.clearInactivityTimeout();
    this.scheduleInactivityTimeout();
  }

  /**
   * Schedules the inactivity timeout.
   */
  private scheduleInactivityTimeout(): void {
    this.inactivityTimeoutId = setTimeout(() => this.stopRecording(), this.inactivityTimeoutDuration);
  }

  /**
   * Clears the inactivity timeout if set.
   */
  private clearInactivityTimeout(): void {
    if (this.inactivityTimeoutId) {
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
      this.trainingDay.durationInMinutes = Math.max(duration - 25, 0); // Subtract 25 minutes for inactivity
    }
  }
}
