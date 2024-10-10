import { NotificationPayload } from '../notifications/notification-payload.js';
import pushSubscriptionService from '../notifications/push-notification-service.js';
import { UserId } from '../webSocket/userId.type.js';
import { RestTimer } from './restTimer.js';

export class RestTimerKeepAliveService {
  private timers: Map<UserId, RestTimer> = new Map();

  startTimer(userId: string, fingerprint: string): void {
    if (this.timers.has(userId)) {
      console.log(`Timer for user ${userId} is already running.`);
      return;
    }

    const timer: RestTimer = {
      fingerprint: fingerprint,
      intervalId: setInterval(() => {
        this.sendKeepAliveSignal(userId);
      }, 20000)
    };
    this.timers.set(userId, timer);
  }

  stopTimer(userId: string): void {
    const timer = this.timers.get(userId);
    if (!timer) return;

    clearInterval(timer.intervalId);
    this.timers.delete(userId);
    console.log(`Stopped and removed timer for user ${userId}.`);
  }

  private async sendKeepAliveSignal(userId: string): Promise<void> {
    const timer = this.timers.get(userId);

    if (!timer) {
      console.log('Unexpected: no timer found for user');
      return;
    }

    const payload: NotificationPayload = {
      title: 'Keep Alive',
      body: `Keeping timer alive`
    };

    try {
      await pushSubscriptionService.sendNotification(userId, payload, timer.fingerprint);
      console.log(`Keep-alive signal sent to user ${userId}`);
    } catch (error) {
      console.error(`Failed to send keep-alive signal to user ${userId}`, error);
    }
  }
}

export default new RestTimerKeepAliveService();
