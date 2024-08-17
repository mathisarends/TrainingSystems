/**
 * @class NotificationManager
 * @classdesc This class manages the creation and closing of notifications
 * within a Service Worker.
 */
class NotificationManager {
  constructor() {
    this.defaultTag = 'timer-notification';
    this.defaultIcon = '/icons/icon-128x128.png';
  }
  /**
   * Displays a notification.
   *
   * @param {string} title - The title of the notification.
   * @param {string} body - The body text of the notification.
   * @param {Object} [options={}] - Additional options for the notification.
   * @param {string} [options.tag] - The tag for the notification (overrides the default tag).
   * @param {string} [options.icon] - The path to the notification icon (overrides the default icon).
   * @param {Array<number>} [options.vibrate] - A vibration pattern, if supported.
   */
  showNotification(title, body, options = {}) {
    const notificationOptions = {
      tag: this.defaultTag,
      icon: this.defaultIcon,
      ...options,
    };
    self.registration.showNotification(title, {
      body,
      ...notificationOptions,
    });

    setTimeout(() => {
      self.registration.getNotifications({ tag: notificationOptions.tag }).then((notifications) => {
        notifications.forEach((notification) => {
          notification.close();
        });
      });
    }, 60 * 1000);
  }

  /**
   * Closes all open notifications with the default tag.
   */
  closeNotifications() {
    self.registration.getNotifications({ tag: this.defaultTag }).then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
    });
  }
}

self.NotificationManager = NotificationManager;
