import { Exercise } from '../../models/training/exercise.js';
import { TrainingDay } from '../../models/training/trainingDay.js';

export class TrainingSessionTracker {
  private trainingDay: TrainingDay;
  private inactivityTimeoutId: NodeJS.Timeout | null = null;
  private onTimeoutCallback: () => Promise<void>;

  private readonly inactivityTimeoutDuration: number = 10 * 1000;

  constructor(trainingDay: TrainingDay, onTimeoutCallback: () => Promise<void>) {
    this.trainingDay = trainingDay;
    this.onTimeoutCallback = onTimeoutCallback;
  }

  handleActivitySignal(): void {
    if (!this.trainingDay.recording) {
      this.startRecording();
    } else {
      this.resetInactivityTimeout();
    }
  }

  updateTrainingDayExerciseData(exercises: Exercise[]) {
    this.trainingDay.exercises = exercises;
  }

  getTrainingDay() {
    return this.trainingDay;
  }

  cleanup(): void {
    this.clearInactivityTimeout();
  }

  isActivitySignal(fieldName: string, fieldValue: string): boolean {
    return (fieldName.endsWith('weight') && !!fieldValue) || (fieldName.endsWith('actualRPE') && !!fieldValue);
  }

  private startRecording(): void {
    this.trainingDay.startTime = new Date();
    this.trainingDay.recording = true;

    this.scheduleInactivityTimeout();
  }

  private stopRecording(): void {
    console.log('stopRecording');
    this.trainingDay.endTime = new Date();
    this.trainingDay.recording = false;
    this.calculateSessionDuration();
    this.clearInactivityTimeout();

    this.onTimeoutCallback();
  }

  private resetInactivityTimeout(): void {
    console.log('resetInactivityTimeout');
    this.clearInactivityTimeout();
    this.scheduleInactivityTimeout();
  }

  private scheduleInactivityTimeout(): void {
    this.inactivityTimeoutId = setTimeout(() => this.stopRecording(), this.inactivityTimeoutDuration);
    console.log('Inactivity timeout scheduled for:', this.inactivityTimeoutDuration / 1000, 'seconds');
  }

  private clearInactivityTimeout(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }
  }

  private calculateSessionDuration(): void {
    if (this.trainingDay.startTime && this.trainingDay.endTime) {
      const duration = (this.trainingDay.endTime.getTime() - this.trainingDay.startTime.getTime()) / 60000;
      this.trainingDay.durationInMinutes = Math.max(duration, 0);
      console.log('Session duration calculated:', this.trainingDay.durationInMinutes, 'minutes');
    }
  }
}
