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
    body: data.body || 'Sie haben eine neue Nachricht.',
    icon: data.icon || '/default-icon.png',
    data: {
      url: data.url || '/',
    },
  };

  // Debugging: Prüfen, ob die Notification-API unterstützt wird
  if (!self.registration.showNotification) {
    console.error('Benachrichtigungs-API nicht unterstützt');
    return;
  }

  console.log('🚀 ~ Zeige Benachrichtigung an:', data.title, options);

  // Versuche die Benachrichtigung anzuzeigen
  event.waitUntil(
    self.registration
      .showNotification(data.title || 'Benachrichtigung', options)
      .then(() => console.log('Benachrichtigung erfolgreich angezeigt'))
      .catch((error) => console.error('Fehler beim Anzeigen der Benachrichtigung:', error)),
  );
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
