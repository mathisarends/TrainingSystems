importScripts('timer.js');
importScripts('notification-manager.js');

const notificationManager = new self.NotificationManager();
const timer = new self.Timer(notificationManager);

/**
 * Handles the 'install' event of the Service Worker.
 * This event is triggered when the Service Worker is being installed.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.resolve()
      .then(() => console.log('[Service Worker] Installation successful'))
      .catch((error) => console.error('[Service Worker] Installation failed:', error)),
  );
});

/**
 * Handles the 'activate' event of the Service Worker.
 * This event is triggered when the Service Worker is activated.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.resolve()
      .then(() => console.log('[Service Worker] Activation successful'))
      .catch((error) => console.error('[Service Worker] Activation failed:', error)),
  );
});

self.addEventListener('push', function (event) {
  console.log('Push-Benachrichtigung empfangen:', event);

  const data = event.data ? event.data.json() : { title: 'Standard-Titel', body: 'Standard-Nachricht' };
  console.log('🚀 ~ data:', data);

  const options = {
    tag: data.tag,
    data: {
      url: data.url || '/',
    },
  };

  notificationManager.showNotification(data.title, data.body, options);
});

// redirect
self.addEventListener('notificationclick', function (event) {
  const notification = event.notification;
  const url = notification.data.url || '/';

  event.waitUntil(clients.openWindow(url));

  notification.close();
});

/**
 * Handles incoming messages from the client.
 *
 * @param {MessageEvent} event - The message event containing data sent from the client.
 */
self.addEventListener('message', function (event) {
  const data = event.data;

  switch (data.command) {
    case 'start':
      timer.startTimer(data.duration);
      break;
    case 'stop':
      timer.stopTimer();
      timer.closeNotifications();
      break;
    case 'pauseTimer':
      timer.pauseTimer();
      break;
    case 'continueTimer':
      timer.continueTimer();
      break;
    case 'keepAlive':
      if (!timer.isTimerPaused) {
        timer.restartRestPauseTimer(data.duration - 1);
      }
      break;
    case 'adjustTime':
      timer.remainingTime += data.seconds;
      break;
    case 'setTime':
      timer.remainingTime = data.newRemainingTime;
  }
});
