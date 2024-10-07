import { UserId } from '../webSocket/userId.type.js';
import webSocketService from '../webSocket/webSocketService.js';
import { RestTimer } from './restTimer.js';

export class RestTimerService {
  private timers: Map<UserId, RestTimer> = new Map();

  startTimer(userId: string, duration: number): void {
    if (this.timers.has(userId)) {
      console.log(`Timer for user ${userId} is already running.`);
      return;
    }

    const newTimer: RestTimer = {
      userId: userId,
      remainingTime: duration,
      intervalId: this.createInterval(userId)
    };

    this.timers.set(userId, newTimer);
    console.log(`Started timer for user ${userId} with ${duration} seconds.`);
  }

  stopTimer(userId: string): void {
    const timer = this.timers.get(userId);
    if (timer) {
      clearInterval(timer.intervalId);
      this.timers.delete(userId);
      console.log(`Stopped and removed timer for user ${userId}.`);
    } else {
      console.log(`No timer found for user ${userId}.`);
    }
  }

  getRemainingTime(userId: string): number | null {
    const timer = this.timers.get(userId);
    return timer ? timer.remainingTime : null;
  }

  private createInterval(userId: string): NodeJS.Timeout {
    let elapsedSeconds = 0; // Track the number of seconds elapsed

    return setInterval(() => {
      const timer = this.timers.get(userId);
      if (!timer) return;

      timer.remainingTime--;
      elapsedSeconds++;

      if (elapsedSeconds >= 10) {
        this.sendKeepAliveSignal(userId, timer.remainingTime);
        elapsedSeconds = 0;
      }

      if (timer.remainingTime <= 0) {
        this.stopTimer(userId);
        console.log(`Timer for user ${userId} has finished.`);
      }
    }, 1000);
  }

  private sendKeepAliveSignal(userId: string, remainingTime: number): void {
    webSocketService.sendKeepTimerAliveSignal(userId, remainingTime);
    console.log(`Keep-alive signal sent to user ${userId} with remaining time: ${remainingTime}`);
  }
}

export default new RestTimerService();
