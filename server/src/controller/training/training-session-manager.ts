import { Request } from 'express';
import { TrainingSessionTracker } from './training-session-tracker.js';
import { TrainingMetaData } from './training-meta-data.js';

import * as trainingService from '../../service/trainingService.js';

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
  async addTracker(req: Request, userId: string, trainingMetaData: TrainingMetaData): Promise<void> {
    const trainingDay = await this.getTrainingDayFromMetaData(req, userId, trainingMetaData);

    const onTimeoutCallback = () => this.handleSessionTimeout(userId, req, trainingMetaData);

    const tracker = new TrainingSessionTracker(trainingDay, req, userId, onTimeoutCallback);

    this.trackers.set(userId, tracker);
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

  private async getTrainingDayFromMetaData(req: Request, userId: string, trainingMetaData: TrainingMetaData) {
    const userDAO = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: userId });

    const { trainingPlanId, trainingWeekIndex, trainingDayIndex } = trainingMetaData;

    const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);
    return trainingPlan.trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex];
  }

  /**
   * Handles session timeout for a specific user.
   * @param userId - The unique user ID.
   */
  private async handleSessionTimeout(userId: string, req: Request, trainingMetaData: TrainingMetaData): Promise<void> {
    const userDAO = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: userId });
    const trainingDay = await this.getTrainingDayFromMetaData(req, userId, trainingMetaData);

    const tracker = this.getTracker(userId)!;
    const trackerData = tracker.trainingDay;

    trainingDay.recording = trackerData.recording;
    trainingDay.endTime = trackerData.endTime;
    trainingDay.durationInMinutes = trackerData.durationInMinutes;

    await userDAO.update(user);

    this.removeTracker(userId);
  }
}
