import { Injectable } from '@nestjs/common';
import { TrainingDayId } from 'src/push-notifications/model/training-day.type';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { TrainingLogService } from 'src/training-log/training-log.service';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingService } from 'src/training/training.service';
import { TrainingSessionTracker } from './training-session-tracker.service';

@Injectable()
export class TrainingSessionManagerService {
  private trackers: Map<TrainingDayId, TrainingSessionTracker> = new Map();

  constructor(
    private readonly trainingService: TrainingService,
    private readonly pushNotificationService: PushNotificationsService,
    private readonly TrainingLogService: TrainingLogService,
  ) {}

  async getOrCreateTracker(trainingDay: TrainingDay, userId: string): Promise<TrainingSessionTracker> {
    const trainingDayId = trainingDay.id;
    const tracker = this.getTrackerById(trainingDayId);

    if (tracker) return tracker;

    const newTracker = new TrainingSessionTracker(
      trainingDay,
      userId,
      () => this.removeTracker(trainingDayId),
      this.trainingService,
      this.pushNotificationService,
      this.TrainingLogService,
    );

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
    const isValidActualRpeInput = fieldName.endsWith('actualRPE') && !!fieldValue;

    return isValidWeightInput || isValidActualRpeInput;
  }

  private getTrackerById(trainingDayId: TrainingDayId): TrainingSessionTracker | undefined {
    return this.trackers.get(trainingDayId);
  }
}
