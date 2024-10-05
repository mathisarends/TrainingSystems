import { TrainingDayFinishedNotification } from '../../../../models/collections/user/training-fninished-notifcation.js';
import { Exercise } from '../../../../models/training/exercise.js';
import { TrainingDay } from '../../../../models/training/trainingDay.js';
import { InactivityTimeoutManager } from '../../../../service/inactivity-timeout-manager.js';
import { TrainingDayManager } from '../../../../service/training-day-manager.js';
import { getTonnagePerTrainingDay } from '../../../../service/trainingService.js';
import userManager from '../../../../service/userManager.js';

/**
 * The `TrainingSessionTracker` class is responsible for managing a user's training session.
 * It tracks the start and stop times, handles activity signals, manages exercise data,
 * and automatically stops the session after a period of inactivity (25 minutes by default).
 */
export class TrainingSessionTracker {
  lastActivity: Date;
  private trainingDay: TrainingDay;
  private inactivityTimeoutManager: InactivityTimeoutManager;
  private userId: string;
  private readonly INACTIVITY_TIMEOUT_DURATION: number = /* 45 * 60 * 1000; */ 15000;
  private removeTrackerCallback: () => void;

  constructor(trainingDay: TrainingDay, userId: string, removeTrackerCallback: () => void) {
    this.trainingDay = trainingDay;
    this.userId = userId;
    this.removeTrackerCallback = removeTrackerCallback;

    this.inactivityTimeoutManager = new InactivityTimeoutManager(
      this.INACTIVITY_TIMEOUT_DURATION,
      this.stopRecording.bind(this)
    );

    this.lastActivity = new Date();
  }

  handleActivitySignal(): void {
    if (!this.trainingDay.recording) {
      this.startRecording();
    } else {
      this.inactivityTimeoutManager.resetTimeout();
    }

    this.lastActivity = new Date();
  }

  updateTrainingDayExerciseData(exercises: Exercise[]) {
    this.trainingDay.exercises = exercises;
  }

  getUserId(): string {
    return this.userId;
  }

  getTrainingDay() {
    return this.trainingDay;
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

  private stopRecording(): void {
    this.trainingDay.endTime = new Date();
    this.trainingDay.recording = false;
    this.calculateAndSetSessionDuration();
    this.clearInactivityTimeout();

    this.handleSessionTimeout();

    this.removeTrackerCallback();
  }

  /**
   * Calculates the duration of the training session in minutes and stores it in the `TrainingDay` object.
   */
  private calculateAndSetSessionDuration(): void {
    if (this.trainingDay.startTime && this.trainingDay.endTime) {
      const duration =
        (this.trainingDay.endTime.getTime() - this.trainingDay.startTime.getTime() - this.INACTIVITY_TIMEOUT_DURATION) /
        60000;

      const roundedDuration = Math.round(duration / 5) * 5;

      this.trainingDay.durationInMinutes = Math.max(roundedDuration, 0);
    }
  }

  /**
   * Handle the logic for ending the session after timeout.
   * This includes persisting the session and notifying the user.
   */
  private async handleSessionTimeout(): Promise<void> {
    /* if (this.trainingDay.durationInMinutes! >= 30) { */
    const user = await userManager.getUserById(this.userId);
    let trainingDay = await TrainingDayManager.findTrainingDayById(user, this.trainingDay.id);

    trainingDay = this.trainingDay;
    console.log('🚀 ~ TrainingSessionTracker ~ handleSessionTimeout ~ trainingDay:', trainingDay);

    const trainingDayNotification: TrainingDayFinishedNotification = {
      ...trainingDay,
      trainingDayTonnage: getTonnagePerTrainingDay(trainingDay)
    };

    user.trainingDayNotifications.push(trainingDayNotification);
    await userManager.update(user);
  }
  /* } */
}
