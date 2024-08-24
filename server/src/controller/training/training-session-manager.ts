import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingSessionTracker } from './training-session-tracker.js';

/**
 * Manages multiple training session trackers for different users.
 */
export class TrainingSessionManager {
  private trackers: Map<string, TrainingSessionTracker> = new Map();

  /**
   * Adds a new training day to be tracked for a specific user.
   * @param userId - The unique user ID.
   * @param trainingDay - The training day object to track.
   */
  public addTracker(userId: string, trainingDay: TrainingDay): void {
    const onTimeoutCallback = () => this.handleSessionTimeout(userId);
    const tracker = new TrainingSessionTracker(trainingDay, onTimeoutCallback);
    this.trackers.set(userId, tracker);
  }

  /**
   * Retrieves the tracker for a given user.
   * @param userId - The unique user ID.
   * @returns The TrainingSessionTracker instance or undefined if not found.
   */
  public getTracker(userId: string): TrainingSessionTracker | undefined {
    return this.trackers.get(userId);
  }

  /**
   * Removes the tracker for a given user.
   * @param userId - The unique user ID.
   */
  public removeTracker(userId: string): void {
    const tracker = this.trackers.get(userId);
    if (tracker) {
      tracker.cleanup(); // Clean up the tracker before removing
      this.trackers.delete(userId);
    }
  }

  /**
   * Checks if any field in changedData is an activity signal and handles it accordingly.
   * @param userId - The unique user ID.
   * @param changedData - The changed data object.
   */
  public handleActivitySignals(userId: string, changedData: Record<string, string>): void {
    const tracker = this.getTracker(userId);
    if (!tracker) {
      return;
    }

    for (const fieldName of Object.keys(changedData)) {
      if (tracker.isActivitySignal(fieldName)) {
        tracker.handleActivitySignal();
      }
    }
  }

  /**
   * Handles session timeout for a specific user.
   * @param userId - The unique user ID.
   */
  private async handleSessionTimeout(userId: string): Promise<void> {
    console.log(`Session timeout for user: ${userId}`);

    this.removeTracker(userId);
    // Additional logic to handle session timeout, such as persisting state to the database
  }
}
