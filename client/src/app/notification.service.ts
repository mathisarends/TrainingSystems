import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {
    // Request permission for notifications on service initialization
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    }
  }

  /**
   * Send a notification with the specified title and message.
   * @param title - The title of the notification.
   * @param message - The message body of the notification.
   * @param icon - (Optional) The icon to display in the notification.
   * @param autoCloseTime - (Optional) Time in milliseconds to auto-close the notification.
   */
  sendNotification(
    title: string,
    message: string,
    icon?: string,
    autoCloseTime: number = 3000
  ): void {
    if (Notification.permission === 'granted') {
      const notificationOptions: NotificationOptions = {
        body: message,
        icon: icon || 'icons/icon-72x72.png',
      };

      const notification = new Notification(title, notificationOptions);

      // Optional: Auto-close notification after a certain time
      if (autoCloseTime > 0) {
        setTimeout(() => {
          notification.close();
        }, autoCloseTime);
      }
    } else {
      console.warn('Notification permission not granted.');
    }
  }
}
