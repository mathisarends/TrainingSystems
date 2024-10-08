import { NotificationPayload } from '../notifications/notification-payload.js';
import pushSubscriptionService from '../notifications/push-subscription-service.js';
import { UserId } from '../webSocket/userId.type.js';
import { RestTimer } from './restTimer.js';

export class RestTImerKeepAliveService {
  private timers: Map<UserId, RestTimer> = new Map();

  startTimer(userId: string, fingerprint: string, duration: number): void {
    if (this.timers.has(userId)) {
      console.log(`Timer for user ${userId} is already running.`);
      return;
    }

    const timer: RestTimer = {
      remainingTime: duration,
      fingerprint: fingerprint,
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

  private async sendKeepAliveSignal(userId: string, remainingTime: number): Promise<void> {
    const timer = this.timers.get(userId);

    if (!timer) {
      console.log('Unexpected no timer for user');
      return;
    }

    const payload: NotificationPayload = {
      title: 'Keep Alive',
      body: `Remaining time: ${remainingTime} seconds`
    };

    try {
      await pushSubscriptionService.sendNotification(userId, payload, timer.fingerprint);
      console.log(`Keep-alive signal sent to user ${userId} with remaining time: ${remainingTime}`);
    } catch (error) {
      console.error(`Failed to send keep-alive signal to user ${userId}`, error);
    }
  }
}

export default new RestTImerKeepAliveService();
