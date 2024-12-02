import { Injectable } from '@nestjs/common';
import { NotificationPayloadDto } from 'src/push-notifications/model/notification-payload.dto';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';

@Injectable()
export class RestTimerKeepAliveService {
  private activeSessions: Map<string, NodeJS.Timeout> = new Map();
  private readonly sessionTimeout = 20 * 1000;

  constructor(
    private readonly pushNotificationService: PushNotificationsService,
  ) {}

  /**
   * Starts the keep-alive timer for a user and fingerprint combination.
   */
  startTimer(userId: string): void {
    if (this.activeSessions.has(userId)) {
      clearTimeout(this.activeSessions.get(userId));
    }

    this.scheduleKeepAlive(userId);
  }

  /**
   * Stops the keep-alive timer for a user and fingerprint combination.
   */
  stopTimer(userId: string): void {
    // Clear the existing timer
    if (this.activeSessions.has(userId)) {
      clearTimeout(this.activeSessions.get(userId));
      this.activeSessions.delete(userId);
    }
  }

  /**
   * Schedules the next keep-alive signal for a session.
   */
  private scheduleKeepAlive(userId: string): void {
    console.log(
      '🚀 ~ RestTimerKeepAliveService ~ scheduleKeepAlive ~ userId:',
      userId,
    );

    const timer = setTimeout(async () => {
      try {
        await this.sendKeepAliveSignal(userId);
        if (this.activeSessions.has(userId)) {
          this.scheduleKeepAlive(userId);
        }
      } catch (error) {
        console.error(`Error sending keep-alive for ${userId}:`, error);
        this.stopTimer(userId);
      }
    }, this.sessionTimeout);

    this.activeSessions.set(userId, timer);
  }

  /**
   * Sends a keep-alive signal to the user.
   */
  private async sendKeepAliveSignal(userId: string): Promise<void> {
    console.log(
      '🚀 ~ RestTimerKeepAliveService ~ sendKeepAliveSignal ~ userId:',
      userId,
    );
    const payload: NotificationPayloadDto = {
      title: 'Keep Alive',
      body: 'Keeping timer alive',
    };

    await this.pushNotificationService.sendNotification(userId, payload);
  }
}
