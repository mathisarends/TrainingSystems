import webSocketService from '../webSocket/webSocketService.js';
import { RestTimer } from './restTimer.js';

// TODO: Routen, service worker connection, Testen

export class RestTimerService {
  private timers: Map<string, RestTimer> = new Map();

  startTimer(userId: string, duration: number): void {
    if (this.timers.has(userId)) {
      console.log(`Timer for user ${userId} is already running.`);
      return;
    }

    const newTimer: RestTimer = {
      userId: userId,
      remainingTime: duration,
      intervalId: this.createInterval(userId, userId)
    };

    this.timers.set(userId, newTimer);
    console.log(`Started timer for user ${userId} with ${duration} seconds.`);
  }

  stopTimer(trainingDayId: string): void {
    const timer = this.timers.get(trainingDayId);
    if (timer) {
      clearInterval(timer.intervalId);
      this.timers.delete(trainingDayId);
      console.log(`Stopped and removed timer for training day ${trainingDayId}.`);
    } else {
      console.log(`No timer found for training day ${trainingDayId}.`);
    }
  }

  getRemainingTime(trainingDayId: string): number | null {
    const timer = this.timers.get(trainingDayId);
    return timer ? timer.remainingTime : null;
  }

  private createInterval(trainingDayId: string, userId: string): NodeJS.Timeout {
    let elapsedSeconds = 0; // To track the number of seconds elapsed

    return setInterval(() => {
      const timer = this.timers.get(trainingDayId);
      if (timer) {
        timer.remainingTime--;
        elapsedSeconds++;

        if (elapsedSeconds >= 10) {
          webSocketService.sendKeepTimerAliveSignal(userId, timer.remainingTime);
          elapsedSeconds = 0;
        }

        if (timer.remainingTime <= 0) {
          this.stopTimer(trainingDayId);
          console.log(`Timer for training day ${trainingDayId} has finished.`);
          this.onTimerComplete(trainingDayId);
        }
      }
    }, 1000);
  }

  private onTimerComplete(trainingDayId: string): void {
    console.log(`Training day ${trainingDayId} has completed the timer.`);
  }
}

export default new RestTimerService();
