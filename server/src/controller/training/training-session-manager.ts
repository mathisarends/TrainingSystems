import { TrainingSessionTracker } from './training-session-tracker.js';
import { TrainingDayDataLocator } from './training-day-data-locator.js';

import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { User } from '../../models/collections/user/user.js';

/**
 * Manages multiple training session trackers for different users. A training session
 */
export class TrainingSessionManager {
  private trackers: Map<string, TrainingSessionTracker> = new Map();

  /**
   * Adds a new training day to be tracked for a specific user if not already present.
   * If a tracker for the user is already present, this function updates the exercise data.
   * @param userDAO - The data access object for user operations.
   * @param userId - The unique user ID.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  async addOrUpdateTracker(
    userDAO: MongoGenericDAO<User>,
    userId: string,
    trainingDayDataLocator: TrainingDayDataLocator
  ): Promise<void> {
    const tracker = this.getTracker(userId);
    const trainingDay = trainingDayDataLocator.getTrainingDay();

    if (tracker) {
      tracker.updateTrainingDayExerciseData(trainingDay.exercises);
      return;
    }
    const onTimeoutCallback = () => this.handleSessionTimeout(userId, userDAO, trainingDayDataLocator);
    const newTracker = new TrainingSessionTracker(trainingDay, onTimeoutCallback);

    this.trackers.set(userId, newTracker);
  }

  /**
   * Retrieves the tracker for a given user.
   * @param userId - The unique user ID.
   * @returns The TrainingSessionTracker instance associated with the user ID, or undefined if not found.
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
      tracker.cleanup();
      this.trackers.delete(userId);
    }
  }

  /**
   * Processes activity signals to determine if any changes require handling.
   * If any fields in the changedData object correspond to activity signals, the associated tracker will reset its inactivity timeout.
   * @param userId - The unique user ID.
   * @param changedData - The object containing changed data fields.
   */
  handleActivitySignals(userId: string, changedData: Record<string, string>): void {
    const tracker = this.getTracker(userId);
    if (!tracker) {
      return;
    }

    for (const [fieldName, fieldValue] of Object.entries(changedData)) {
      if (tracker.isActivitySignal(fieldName, fieldValue)) {
        tracker.handleActivitySignal();
      }
    }
  }

  /**
   * Handles session timeout for a specific user.
   * This method is called when a user's training session exceeds the allowed inactivity period.
   * It updates the user's training day data in the database and removes the associated tracker.
   * @param userId - The unique user ID.
   * @param userDAO - The data access object for user operations.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  private async handleSessionTimeout(
    userId: string,
    userDAO: MongoGenericDAO<User>,
    trainingDayDataLocator: TrainingDayDataLocator
  ): Promise<void> {
    const { user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex } = trainingDayDataLocator.getData();

    const trainingDuration = this.getTracker(userId)!.getTrainingDay().durationInMinutes!;

    if (trainingDuration >= 30) {
      user.trainingPlans[trainingPlanIndex].trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex] =
        this.getTracker(userId)!.getTrainingDay();
    } else {
      const trainingDay =
        user.trainingPlans[trainingPlanIndex].trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex];

      // Reset relevant data
      trainingDay.startTime = undefined;
      trainingDay.endTime = undefined;
      trainingDay.durationInMinutes = undefined;
      trainingDay.recording = false;
    }
    await userDAO.update(user);

    this.removeTracker(userId);
  }
}
