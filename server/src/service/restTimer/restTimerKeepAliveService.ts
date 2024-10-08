import { UserId } from '../webSocket/userId.type.js';
import { RestTimer } from './restTimer.js';

export class RestTImerKeepAliveService {
  private timers: Map<UserId, RestTimer> = new Map();

  startTimer(userId: string, duration: number): void {
    if (this.timers.has(userId)) {
      console.log(`Timer for user ${userId} is already running.`);
      return;
    }

    const timer: RestTimer = {
      remainingTime: duration,
      intervalId: setInterval(() => {
        timer.remainingTime -= 20;
        this.sendKeepAliveSignal(userId, timer.remainingTime);

        if (timer.remainingTime <= 0) {
          this.stopTimer(userId);
          console.log(`Timer for user ${userId} has finished.`);
        }
      }, 20000)
    };

    this.timers.set(userId, timer);
    console.log(`Started timer for user ${userId} with ${duration} seconds.`);
  }

  stopTimer(userId: string): void {
    const timer = this.timers.get(userId);
    if (!timer) return;

    clearInterval(timer.intervalId);
    this.timers.delete(userId);
    console.log(`Stopped and removed timer for user ${userId}.`);
  }

  private sendKeepAliveSignal(userId: string, remainingTime: number): void {
    /* webSocketService.sendKeepTimerAliveSignal(userId, remainingTime); */
    console.log(`Keep-alive signal sent to user ${userId} with remaining time: ${remainingTime}`);
  }
}

export default new RestTImerKeepAliveService();
