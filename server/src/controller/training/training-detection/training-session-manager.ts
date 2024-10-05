import { TrainingSessionTracker } from './training-session-tracker.js';

import { TrainingDayFinishedNotification } from '../../../models/collections/user/training-fninished-notifcation.js';
import { TrainingDay } from '../../../models/training/trainingDay.js';
import { TrainingDayManager } from '../../../service/training-day-manager.js';
import { getTonnagePerTrainingDay } from '../../../service/trainingService.js';
import userManager from '../../../service/userManager.js';

/**
 * Manages multiple training session trackers for different users.
 * Each tracker is uniquely identified by a combination of user ID and training day ID.
 */
class TrainingSessionManager {
  private trackers: Map<string, TrainingSessionTracker> = new Map();
  private readonly MINIMUM_TRAINING_DURATION_IN_MINUTES = 30;

  /**
   * Adds or updates a training day tracker for a specific training day.
   * If a tracker for the training day is already present, this function updates the exercise data.
   * @param userDAO - The data access object for user operations.
   * @param userId - The unique user ID.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  async addOrUpdateTracker(trainingDay: TrainingDay, userId: string): Promise<TrainingSessionTracker> {
    const trainingDayId = trainingDay.id;
    const tracker = this.getTrackerById(trainingDayId);

    if (tracker) {
      tracker.updateTrainingDayExerciseData(trainingDay.exercises);
      return tracker;
    }

    const onTimeoutCallback = () => this.handleSessionTimeout(trainingDayId, userId);
    const newTracker = new TrainingSessionTracker(trainingDay, userId, onTimeoutCallback);

    this.trackers.set(trainingDayId, newTracker);

    return newTracker;
  }

  removeTracker(trainingDayId: string): void {
    const tracker = this.trackers.get(trainingDayId);
    if (tracker) {
      tracker.clearInactivityTimeout();
      this.trackers.delete(trainingDayId);
    }
  }

  /**
   * Processes activity signals to determine if any changes require handling.
   * If any fields in the changedData object correspond to activity signals, the associated tracker will reset its inactivity timeout.
   * @param trainingDayId - The unique training day ID.
   * @param changedData - The object containing changed data fields.
   */
  handleActivitySignals(trainingDayId: string): void {
    const tracker = this.getTrackerById(trainingDayId);
    if (tracker) {
      tracker.handleActivitySignal();
    }
  }

  private getTrackerById(trainingDayId: string): TrainingSessionTracker | undefined {
    return this.trackers.get(trainingDayId);
  }

  /**
   * Handles session timeout for a specific training day.
   * This method is called when a training session exceeds the allowed inactivity period.
   * It updates the training day data in the database and removes the associated tracker.
   * @param trainingDayId - The unique training day ID.
   * @param userDAO - The data access object for user operations.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  private async handleSessionTimeout(trainingDayId: string, userId: string): Promise<void> {
    const trainingData = this.getTrackerById(trainingDayId)!.getTrainingDay();
    const user = await userManager.getUserById(userId);

    let trainingDayFromManager = await TrainingDayManager.findTrainingDayById(user, trainingDayId);

    // CHECK FOR REAL SESSION NOT JUST MINOR CHANGES
    /* if (trainingData.durationInMinutes! >= this.MINIMUM_TRAINING_DURATION_IN_MINUTES) { */
    trainingDayFromManager = trainingData;

    const trainingDayNotification: TrainingDayFinishedNotification = {
      ...trainingData,
      trainingDayTonnage: getTonnagePerTrainingDay(trainingDayFromManager)
    };

    user.trainingDayNotifications.push(trainingDayNotification);

    await userManager.update(user);

    /* } */

    this.removeTracker(trainingDayId);
  }
}

export default new TrainingSessionManager();
