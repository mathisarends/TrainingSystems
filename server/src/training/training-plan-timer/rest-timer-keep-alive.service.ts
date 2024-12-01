import { Injectable } from '@nestjs/common';
import { NotificationPayloadDto } from 'src/push-notifications/model/notification-payload.dto';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';

/**
 * Sends a keep-alive signal to the service-worker in order to prevent the timer from stopping.
 */
@Injectable()
export class RestTimerKeepAliveService {
  private activeSessions: Set<string> = new Set();
  private readonly intervalDuration = 20 * 1000;

  constructor(
    private readonly pushNotificationService: PushNotificationsService,
  ) {
    setInterval(() => this.checkAndSendKeepAlive(), this.intervalDuration);
  }

  /**
   * Starts the keep-alive timer for a user and fingerprint combination.
   */
  startTimer(userId: string, fingerprint: string): void {
    const key = this.generateCompositeKey(userId, fingerprint);
    this.activeSessions.add(key);
  }

  /**
   * Stops the keep-alive timer for a user and fingerprint combination.
   */
  stopTimer(userId: string, fingerprint: string): void {
    const key = this.generateCompositeKey(userId, fingerprint);
    this.activeSessions.delete(key);
  }

  /**
   * Periodically checks active sessions and sends keep-alive signals.
   */
  private async checkAndSendKeepAlive(): Promise<void> {
    for (const key of this.activeSessions) {
      const { userId, fingerprint } = this.extractUserIdAndFingerprint(key);
      await this.sendKeepAliveSignal(userId, fingerprint);
    }
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

    try {
      await this.pushNotificationService.sendNotification(
        userId,
        fingerprint,
        payload,
      );
      console.log(`Keep-alive signal sent to user ${userId}`);
    } catch (error) {
      console.error(
        `Failed to send keep-alive signal to user ${userId}`,
        error,
      );
    }
  }

  /**
   * Generates a composite key combining userId and fingerprint.
   */
  private generateCompositeKey(userId: string, fingerprint: string): string {
    return `${userId}-${fingerprint}`;
  }

  /**
   * Extracts userId and fingerprint from a composite key.
   */
  private extractUserIdAndFingerprint(compositeKey: string): {
    userId: string;
    fingerprint: string;
  } {
    const [userId, fingerprint] = compositeKey.split('-');
    return { userId, fingerprint };
  }
}
