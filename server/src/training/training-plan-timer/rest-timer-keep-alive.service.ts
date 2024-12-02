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
  startTimer(userId: string, fingerprint: string): void {
    const key = this.generateCompositeKey(userId, fingerprint);

    if (this.activeSessions.has(key)) {
      clearTimeout(this.activeSessions.get(key));
    }

    this.scheduleKeepAlive(userId, fingerprint);
  }

  /**
   * Stops the keep-alive timer for a user and fingerprint combination.
   */
  stopTimer(userId: string, fingerprint: string): void {
    const key = this.generateCompositeKey(userId, fingerprint);

    // Clear the existing timer
    if (this.activeSessions.has(key)) {
      clearTimeout(this.activeSessions.get(key));
      this.activeSessions.delete(key);
    }
  }

  /**
   * Schedules the next keep-alive signal for a session.
   */
  private scheduleKeepAlive(userId: string, fingerprint: string): void {
    console.log(
      '🚀 ~ RestTimerKeepAliveService ~ scheduleKeepAlive ~ fingerprint:',
      fingerprint,
    );
    console.log(
      '🚀 ~ RestTimerKeepAliveService ~ scheduleKeepAlive ~ userId:',
      userId,
    );
    const key = this.generateCompositeKey(userId, fingerprint);

    const timer = setTimeout(async () => {
      try {
        await this.sendKeepAliveSignal(userId, fingerprint);
        if (this.activeSessions.has(key)) {
          this.scheduleKeepAlive(userId, fingerprint);
        }
      } catch (error) {
        console.error(`Error sending keep-alive for ${userId}:`, error);
        this.stopTimer(userId, fingerprint);
      }
    }, this.sessionTimeout);

    this.activeSessions.set(key, timer);
  }

  /**
   * Sends a keep-alive signal to the user.
   */
  private async sendKeepAliveSignal(
    userId: string,
    fingerprint: string,
  ): Promise<void> {
    const payload: NotificationPayloadDto = {
      title: 'Keep Alive',
      body: 'Keeping timer alive',
    };

    await this.pushNotificationService.sendNotification(
      userId,
      fingerprint,
      payload,
    );
  }

  /**
   * Generates a composite key combining userId and fingerprint.
   */
  private generateCompositeKey(userId: string, fingerprint: string): string {
    return `${userId}-${fingerprint}`;
  }
}
