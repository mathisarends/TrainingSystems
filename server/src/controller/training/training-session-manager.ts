import { TrainingSessionTracker } from './training-session-tracker.js';
import { TrainingMetaData } from './training-meta-data.js';

import { TrainingDay } from '../../models/training/trainingDay.js';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { User } from '../../models/collections/user/user.js';

/**
 * Manages multiple training session trackers for different users.
 */
export class TrainingSessionManager {
  private trackers: Map<string, TrainingSessionTracker> = new Map();

  /**
   * Adds a new training day to be tracked for a specific user.
   *    * @param req - request object in order to save data after timeout.
   * @param userId - The unique user ID.
   * @param trainingDay - The training day object to track.
   */
  async addTrackerIfNotPresent(
    userDAO: MongoGenericDAO<User>,
    userId: string,
    trainingMetaData: TrainingMetaData
  ): Promise<void> {
    const trainingDay = this.getTrainingDayFromMetaData(trainingMetaData);

    const onTimeoutCallback = () => this.handleSessionTimeout(userId, userDAO, trainingMetaData);

    const tracker = this.getTracker(userId);
    if (!tracker) {
      const tracker = new TrainingSessionTracker(trainingDay, onTimeoutCallback);

      this.trackers.set(userId, tracker);
    }
  }

  /**
   * Retrieves the tracker for a given user.
   * @param userId - The unique user ID.
   * @returns The TrainingSessionTracker instance or undefined if not found.
   */
  getTracker(userId: string): TrainingSessionTracker | undefined {
    return this.trackers.get(userId);
  }

  /**
   * Removes the tracker for a given user.
   * @param userId - The unique user ID.
   */
  removeTracker(userId: string): void {
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
  handleActivitySignals(userId: string, changedData: Record<string, string>): void {
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

  private getTrainingDayFromMetaData(trainingMetaData: TrainingMetaData): TrainingDay {
    const { user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex } = trainingMetaData;
    return user.trainingPlans[trainingPlanIndex].trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex];
  }

  /**
   * Handles session timeout for a specific user.
   * @param userId - The unique user ID.
   */
  private async handleSessionTimeout(
    userId: string,
    userDAO: MongoGenericDAO<User>,
    trainingMetaData: TrainingMetaData
  ): Promise<void> {
    const { user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex } = trainingMetaData;

    user.trainingPlans[trainingPlanIndex].trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex] =
      this.getTracker(userId)!.trainingDay;

    await userDAO.update(user);

    this.removeTracker(userId);
  }
}
