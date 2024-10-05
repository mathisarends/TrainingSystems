import { TrainingDay } from '../../../models/training/trainingDay.js';
import { TrainingPlanId } from './training-plan-id.type.js';
import { TrainingSessionTracker } from './training-session-tracker/training-session-tracker.js';

/**
 * Manages multiple training session trackers for different users.
 * Each tracker is uniquely identified by a combination of user ID and training day ID.
 */
class TrainingSessionManager {
  private trackers: Map<TrainingPlanId, TrainingSessionTracker> = new Map();

  async getOrCreateTracker(trainingDay: TrainingDay, userId: string): Promise<TrainingSessionTracker> {
    const trainingDayId = trainingDay.id;
    const tracker = this.getTrackerById(trainingDayId);

    if (tracker) {
      tracker.updateTrainingDayExerciseData(trainingDay.exercises);
      return tracker;
    }

    const newTracker = new TrainingSessionTracker(trainingDay, userId, () => this.removeTracker(trainingDayId));

    this.trackers.set(trainingDayId, newTracker);
    return newTracker;
  }

  removeTracker(trainingDayId: TrainingPlanId): void {
    const tracker = this.getTrackerById(trainingDayId);
    if (tracker) {
      tracker.clearInactivityTimeout();
      this.trackers.delete(trainingDayId);
    }
  }

  private getTrackerById(trainingDayId: TrainingPlanId): TrainingSessionTracker | undefined {
    return this.trackers.get(trainingDayId);
  }
}

export default new TrainingSessionManager();
