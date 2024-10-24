import { Injectable } from '@nestjs/common';
import { NotificationPayloadDto } from 'src/push-notifications/model/notification-payload.dto';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';
import { KeepAliveIntervalId } from 'src/training/model/keep-alive-interval-id.type';
import { UserId } from 'src/training/model/userId.type';

@Injectable()
export class RestTimerKeepAliveService {
  /**
   * Stores the active timers for each user, identified by UserId.
   */
  private timers: Map<UserId, KeepAliveIntervalId> = new Map();

  constructor(
    private readonly pushNotificationService: PushNotificationsService,
  ) {}

  async startTimer(userId: string) {
    if (this.timers.has(userId)) {
      return;
    }

    const keepAliveInterval = setInterval(async () => {
      await this.sendKeepAliveSignal(userId);
    });

    this.timers.set(userId, keepAliveInterval);
  }

  stopTimer(userId: string): void {
    const keepAliveTimerIntervalId = this.timers.get(userId);

    if (!keepAliveTimerIntervalId) {
      return;
    }
    clearInterval(keepAliveTimerIntervalId);
    this.timers.delete(userId);

    console.log(`Stopped and removed timer for user ${userId}.`);
  }

  private async sendKeepAliveSignal(userId: string): Promise<void> {
    const timer = this.timers.get(userId);

    if (!timer) {
      console.log('Unexpected: no timer found for user');
      return;
    }

    const payload: NotificationPayloadDto = {
      title: 'Keep Alive',
      body: `Keeping timer alive`,
    };

    try {
      await this.pushNotificationService.sendNotification(userId, payload);
      console.log(`Keep-alive signal sent to user ${userId}`);
    } catch (error) {
      console.error(
        `Failed to send keep-alive signal to user ${userId}`,
        error,
      );
    }
  }
}
