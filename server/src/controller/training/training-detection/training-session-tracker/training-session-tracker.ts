import { TrainingDay } from '../../../../models/training/trainingDay.js';
import { InactivityTimeoutManager } from '../../../../service/inactivity-timeout-manager.js';
import { TrainingDayFinishedNotificationService } from '../../../../service/notifications/training-finished-notification-service.js';
import { TrainingDayManager } from '../../../../service/training-day-manager.js';
import userManager from '../../../../service/userManager.js';

/**
 * The `TrainingSessionTracker` class is responsible for managing a user's training session.
 * It tracks the start and stop times, handles activity signals, manages exercise data,
 * and automatically stops the session after a period of inactivity (25 minutes by default).
 */
export class TrainingSessionTracker {
  private trainingDay: TrainingDay;
  private inactivityTimeoutManager: InactivityTimeoutManager;
  private userId: string;
  private readonly INACTIVITY_TIMEOUT_DURATION: number = 45 * 60 * 1000;
  private readonly MINIMUM_TRAINING_DURATION_IN_MINUTES: number = 30;
  private removeTrackerCallback: () => void;

  constructor(trainingDay: TrainingDay, userId: string, removeTrackerCallback: () => void) {
    this.trainingDay = trainingDay;
    this.userId = userId;
    this.removeTrackerCallback = removeTrackerCallback;

    this.inactivityTimeoutManager = new InactivityTimeoutManager(
      this.INACTIVITY_TIMEOUT_DURATION,
      this.stopRecording.bind(this)
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
      (this.trainingDay.endTime.getTime() - this.trainingDay.startTime.getTime() - this.INACTIVITY_TIMEOUT_DURATION) /
      60000;

    const roundedDuration = Math.round(duration / 5) * 5;
    this.trainingDay.durationInMinutes = Math.max(roundedDuration, 0);
  }

  private async handleSessionTimeout(): Promise<void> {
    if (!this.isMinimumTrainingDurationMet(this.trainingDay.durationInMinutes!)) {
      return;
    }

    const user = await userManager.getUserById(this.userId);
    const trainingDay = await TrainingDayManager.findTrainingDayById(user, this.trainingDay.id);

    this.addRelevantTrackingDataToTrainingDay(trainingDay);

    const trainingDayFinishedNotification =
      TrainingDayFinishedNotificationService.toTrainingFinishedNotificationDto(trainingDay);

    user.trainingDayNotifications.push(trainingDayFinishedNotification);
    await userManager.update(user);
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
