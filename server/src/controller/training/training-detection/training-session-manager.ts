import { TrainingDay } from '../../../models/training/trainingDay.js';
import { TrainingDayId } from './training-day-id.type.js';
import { TrainingSessionTracker } from './training-session-tracker/training-session-tracker.js';

/**
 * Manages multiple training session trackers for different users.
 * Each tracker is uniquely identified by a combination of user ID and training day ID.
 */
class TrainingSessionManager {
  private trackers: Map<TrainingDayId, TrainingSessionTracker> = new Map();

  async getOrCreateTracker(trainingDay: TrainingDay, userId: string): Promise<TrainingSessionTracker> {
    const trainingDayId = trainingDay.id;
    const tracker = this.getTrackerById(trainingDayId);

    if (tracker) return tracker;

    const newTracker = new TrainingSessionTracker(trainingDay, userId, () => this.removeTracker(trainingDayId));

    this.trackers.set(trainingDayId, newTracker);
    return newTracker;
  }

  removeTracker(trainingDayId: TrainingDayId): void {
    const tracker = this.getTrackerById(trainingDayId);
    if (tracker) {
      tracker.clearInactivityTimeout();
      this.trackers.delete(trainingDayId);
    }
  }

  isTrainingActivitySignal(fieldName: string, fieldValue: string): boolean {
    const isValidWeightInput = fieldName.endsWith('weight') && !!fieldValue;
    const isValidActualRpeINput = fieldName.endsWith('actualRPE') && !!fieldValue;

    return isValidWeightInput || isValidActualRpeINput;
  }

  private getTrackerById(trainingDayId: TrainingDayId): TrainingSessionTracker | undefined {
    return this.trackers.get(trainingDayId);
  }
}

export default new TrainingSessionManager();
