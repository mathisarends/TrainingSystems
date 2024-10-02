import { TrainingDayDataLocator } from './training-day-data-locator.js';
import { TrainingSessionTracker } from './training-session-tracker.js';

import { TrainingDAyFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { getTonnagePerTrainingDay } from '../../service/trainingService.js';
import userManager from '../../service/userManager.js';
import { sendMailForTrainingDaySummary } from './training-summary/training-day-summary.js';
import { TrainingSummary } from './training-summary/training-summary.js';

/**
 * Manages multiple training session trackers for different users.
 * Each tracker is uniquely identified by a combination of user ID and training day ID.
 */
class TrainingSessionManager {
  private trackers: Map<string, TrainingSessionTracker> = new Map();

  /**
   * Adds or updates a training day tracker for a specific training day.
   * If a tracker for the training day is already present, this function updates the exercise data.
   * @param userDAO - The data access object for user operations.
   * @param userId - The unique user ID.
   * @param trainingDayDataLocator - The data locator object that provides access to the training day data.
   */
  async addOrUpdateTracker(trainingDayDataLocator: TrainingDayDataLocator): Promise<TrainingSessionTracker> {
    const trainingDay = trainingDayDataLocator.getTrainingDay();
    const trainingDayId = trainingDay.id;
    const tracker = this.getTracker(trainingDayId);

    if (tracker) {
      tracker.updateTrainingDayExerciseData(trainingDay.exercises);
      return tracker;
    }

    const onTimeoutCallback = () => this.handleSessionTimeout(trainingDayId, trainingDayDataLocator);
    const newTracker = new TrainingSessionTracker(trainingDay, onTimeoutCallback);

    this.trackers.set(trainingDayId, newTracker);

    return newTracker;
  }

  getTracker(trainingDayId: string): TrainingSessionTracker | undefined {
    return this.trackers.get(trainingDayId);
  }

  removeTracker(trainingDayId: string): void {
    const tracker = this.trackers.get(trainingDayId);
    if (tracker) {
      tracker.cleanup();
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
    const tracker = this.getTracker(trainingDayId);
    if (!tracker) {
      return;
    }

    tracker.handleActivitySignal();
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
    trainingDayDataLocator: TrainingDayDataLocator
  ): Promise<void> {
    const { user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex } = trainingDayDataLocator.getData();

    const trainingData = this.getTracker(trainingDayId)!.getTrainingDay();

    // CHECK FOR REAL SESSION NOT JUST MINOR CHANGES
    if (trainingData.durationInMinutes! >= 30) {
      user.trainingPlans[trainingPlanIndex].trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex] =
        trainingData;

      const trainingDayNotification: TrainingDAyFinishedNotification = {
        ...trainingData,
        trainingDayTonnage: getTonnagePerTrainingDay(trainingData)
      };

      user.trainingDayNotifications.push(trainingDayNotification);

      const userDAO = userManager.getUserGenericDAO();
      await userDAO.update(user);

      const trainingDaySummary: TrainingSummary = {
        trainingPlanTitle: user.trainingPlans[trainingPlanIndex].title,
        trainingDayWeekNumber: trainingWeekIndex + 1,
        trainingDayDayNumber: trainingDayIndex + 1,
        ...trainingDayNotification
      };

      if (user.isTrainingSummaryEmailEnabled !== false) {
        await sendMailForTrainingDaySummary(trainingDaySummary, user.email);
      }
    }

    this.removeTracker(trainingDayId);
  }
}

export default new TrainingSessionManager();
