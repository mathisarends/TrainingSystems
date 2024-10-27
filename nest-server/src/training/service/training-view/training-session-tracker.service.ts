import { NotificationPayloadDto } from 'src/push-notifications/model/notification-payload.dto';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingService } from 'src/training/training.service';
import { InactivityTimeoutManager } from './inactivity-timeout-manager';

export class TrainingSessionTracker {
  private readonly INACTIVITY_TIMEOUT_DURATION: number = 45 * 60 * 1000;
  private readonly MINIMUM_TRAINING_DURATION_IN_MINUTES: number = 30;
  private inactivityTimeoutManager: InactivityTimeoutManager;

  constructor(
    private readonly trainingDay: TrainingDay,
    private readonly userId: string,
    private readonly fingerprint: string,
    private readonly removeTrackerCallback: () => void,
    private readonly trainingService: TrainingService,
    private readonly pushNotificationService: PushNotificationsService,
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
    if (
      !this.isMinimumTrainingDurationMet(this.trainingDay.durationInMinutes!)
    ) {
      return;
    }

    const trainingDay = await this.trainingService.getCertainTrainingDay(
      this.userId,
      this.trainingDay.id,
    );

    this.addRelevantTrackingDataToTrainingDay(trainingDay);
    await this.sendTrainingSummaryPushNotification();
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

  private addRelevantTrackingDataToTrainingDay(trainingDay: TrainingDay): void {
    trainingDay.startTime = this.trainingDay.startTime;
    trainingDay.recording = false;
    trainingDay.endTime = this.trainingDay.endTime;
    trainingDay.durationInMinutes = this.trainingDay.durationInMinutes;
  }

  private isMinimumTrainingDurationMet(trainingDuration: number) {
    return trainingDuration >= this.MINIMUM_TRAINING_DURATION_IN_MINUTES;
  }
}
