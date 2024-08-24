import { TrainingSessionTracker } from './training-session-tracker.js';
import { TrainingDayDataLocator } from './training-day-data-locator.js';

import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { User } from '../../models/collections/user/user.js';

/**
 * Manages multiple training session trackers for different users.
 * Each tracker is uniquely identified by a combination of user ID and training day ID.
 */
export class TrainingSessionManager {
  private trackers: Map<string, TrainingSessionTracker> = new Map();

  /**
   * Adds or updates a training day tracker for a specific training day.
   * If a tracker for the training day is already present, this function updates the exercise data.
   * @param userDAO - The data access object for user operations.
   * @param userId - The unique user ID.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  async addOrUpdateTracker(
    userDAO: MongoGenericDAO<User>,
    trainingDayDataLocator: TrainingDayDataLocator
  ): Promise<void> {
    const trainingDay = trainingDayDataLocator.getTrainingDay();
    const trainingDayId = trainingDay.id;
    console.log('🚀 ~ TrainingSessionManager ~ trainingDayId:', trainingDayId);
    const tracker = this.getTracker(trainingDayId); // Use trainingDayId for consistency

    if (tracker) {
      tracker.updateTrainingDayExerciseData(trainingDay.exercises);
      return;
    }

    const onTimeoutCallback = () => this.handleSessionTimeout(trainingDayId, userDAO, trainingDayDataLocator);
    const newTracker = new TrainingSessionTracker(trainingDay, onTimeoutCallback);

    this.trackers.set(trainingDayId, newTracker); // Store tracker with trainingDayId as the key
  }

  /**
   * Retrieves the tracker for a given training day ID.
   * @param trainingDayId - The unique training day ID.
   * @returns The TrainingSessionTracker instance associated with the training day ID, or undefined if not found.
   */
  getTracker(trainingDayId: string): TrainingSessionTracker | undefined {
    return this.trackers.get(trainingDayId);
  }

  /**
   * Removes the tracker for a given training day ID.
   * @param trainingDayId - The unique training day ID.
   */
  removeTracker(trainingDayId: string): void {
    const tracker = this.trackers.get(trainingDayId);
    if (tracker) {
      tracker.cleanup();
      this.trackers.delete(trainingDayId); // Remove using trainingDayId
    }
  }

  /**
   * Processes activity signals to determine if any changes require handling.
   * If any fields in the changedData object correspond to activity signals, the associated tracker will reset its inactivity timeout.
   * @param trainingDayId - The unique training day ID.
   * @param changedData - The object containing changed data fields.
   */
  handleActivitySignals(trainingDayId: string, changedData: Record<string, string>): void {
    const tracker = this.getTracker(trainingDayId);
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
   * Handles session timeout for a specific training day.
   * This method is called when a training session exceeds the allowed inactivity period.
   * It updates the training day data in the database and removes the associated tracker.
   * @param trainingDayId - The unique training day ID.
   * @param userDAO - The data access object for user operations.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  private async handleSessionTimeout(
    trainingDayId: string,
    userDAO: MongoGenericDAO<User>,
    trainingDayDataLocator: TrainingDayDataLocator
  ): Promise<void> {
    const { user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex } = trainingDayDataLocator.getData();

    const trainingData = this.getTracker(trainingDayId)!.getTrainingDay();

    // CHECK FOR REAL SESSION NOT JUST MINOR CHANGES
    if (trainingData.durationInMinutes! >= 30) {
      user.trainingPlans[trainingPlanIndex].trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex] =
        trainingData;

      await userDAO.update(user);
    }

    this.removeTracker(trainingDayId); // Remove tracker with trainingDayId
  }
}
