import { NotificationPayloadDto } from 'src/push-notifications/model/notification-payload.dto';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { TrainingLogService } from 'src/training-log/training-log.service';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingService } from 'src/training/training.service';
import { TrainingPlan } from '../model/training-plan.model';
import { InactivityTimeoutManager } from './inactivity-timeout-manager';

export class TrainingSessionTracker {
  private readonly INACTIVITY_TIMEOUT_DURATION: number = 15 * 1000;
  private readonly MINIMUM_TRAINING_DURATION_IN_MINUTES: number = 30;
  private inactivityTimeoutManager: InactivityTimeoutManager;

  constructor(
    private readonly trainingDay: TrainingDay,
    private readonly userId: string,
    private readonly fingerprint: string,
    private readonly removeTrackerCallback: () => void,
    private readonly trainingService: TrainingService,
    private readonly pushNotificationService: PushNotificationsService,
    private readonly trainingLogService: TrainingLogService,
  ) {
    this.inactivityTimeoutManager = new InactivityTimeoutManager(
      this.INACTIVITY_TIMEOUT_DURATION,
      this.stopRecording.bind(this),
    );
  }

  handleActivitySignal(): void {
    if (!this.trainingDay.recording) {
      this.startRecording();
    } else {
      this.inactivityTimeoutManager.resetTimeout();
    }
  }

  clearInactivityTimeout(): void {
    this.inactivityTimeoutManager.clearTimeout();
  }

  private startRecording(): void {
    const currentTime = new Date();

    this.trainingDay.startTime = currentTime;
    this.trainingDay.recording = true;

    this.inactivityTimeoutManager.startTimeout();
  }

  private async stopRecording(): Promise<void> {
    this.trainingDay.endTime = new Date();
    this.trainingDay.recording = false;
    this.calculateAndSetSessionDuration();

    await this.handleSessionTimeout();

    this.removeTrackerCallback();
  }

  private calculateAndSetSessionDuration(): void {
    if (!this.trainingDay.startTime || !this.trainingDay.endTime) {
      return;
    }

    const duration =
      (this.trainingDay.endTime.getTime() -
        this.trainingDay.startTime.getTime() -
        this.INACTIVITY_TIMEOUT_DURATION) /
      60000;

    const roundedDuration = Math.round(duration / 5) * 5;
    this.trainingDay.durationInMinutes = Math.max(roundedDuration, 0);
  }

  private async handleSessionTimeout(): Promise<void> {
    /* if (
      !this.isMinimumTrainingDurationMet(this.trainingDay.durationInMinutes!)
    ) {
      return;
    } */

    const trainingDay = await this.trainingService.getCertainTrainingDay(
      this.userId,
      this.trainingDay.id,
    );

    await this.addRelevantTrackingDataToTrainingDay(trainingDay);
    await this.sendTrainingSummaryPushNotification();

    await this.trainingLogService.createTrainingLogNotification(this.userId);
  }

  private async sendTrainingSummaryPushNotification() {
    const notificationPayload: NotificationPayloadDto = {
      title: 'TYR TS',
      body: 'Trainingszusammenfassung verfügbar',
      url: '/logs',
      tag: 'training-summary-notification',
      vibrate: [200, 100, 200],
    };
    await this.pushNotificationService.sendNotification(
      this.userId,
      this.fingerprint,
      notificationPayload,
    );
  }

  private async addRelevantTrackingDataToTrainingDay(
    trainingDay: TrainingDay,
  ): Promise<void> {
    trainingDay.startTime = this.trainingDay.startTime;
    trainingDay.recording = false;
    trainingDay.endTime = this.trainingDay.endTime;
    trainingDay.durationInMinutes = this.trainingDay.durationInMinutes;

    const trainingPlan =
      await this.trainingService.getTrainingPlanByTrainingDay(
        this.userId,
        trainingDay,
      );

    if (!trainingPlan) {
      throw new Error('TrainingPlan not found');
    }

    const updated = this.updateTrainingDayInWeeks(trainingPlan, trainingDay);

    if (!updated) {
      throw new Error('TrainingDay not found in any TrainingWeek');
    }

    trainingPlan.markModified('trainingWeeks');

    await trainingPlan.save();
  }

  /**
   * Updates the training day within the appropriate week in the training plan.
   * Modifications must be applied at the week level due to the nested structure.
   * @returns True if the training day was successfully updated; otherwise, false.
   */
  private updateTrainingDayInWeeks(
    trainingPlan: TrainingPlan,
    trainingDay: TrainingDay,
  ): boolean {
    for (const week of trainingPlan.trainingWeeks) {
      const dayIndex = week.trainingDays.findIndex(
        (day) => day.id === trainingDay.id,
      );

      if (dayIndex !== -1) {
        week.trainingDays[dayIndex].startTime = trainingDay.startTime;
        week.trainingDays[dayIndex].endTime = trainingDay.endTime;
        week.trainingDays[dayIndex].recording = trainingDay.recording;
        week.trainingDays[dayIndex].durationInMinutes =
          trainingDay.durationInMinutes;
        return true;
      }
    }
    return false;
  }

  private isMinimumTrainingDurationMet(trainingDuration: number) {
    return trainingDuration >= this.MINIMUM_TRAINING_DURATION_IN_MINUTES;
  }
}
