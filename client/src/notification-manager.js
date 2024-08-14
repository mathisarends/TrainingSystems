class NotificationManager {
  constructor() {
    this.defaultTag = 'timer-notification';
    this.defaultIcon = '/images/logo-own.png';
  }

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
  }

  closeNotifications() {
    self.registration.getNotifications({ tag: this.defaultTag }).then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
    });
  }
}

self.NotificationManager = NotificationManager;
