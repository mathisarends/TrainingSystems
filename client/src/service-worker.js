importScripts('timer.js');
importScripts('notification-manager.js');

const notificationManager = new self.NotificationManager();
const timer = new self.Timer(notificationManager);

self.addEventListener('install', async (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);

  try {
    await Promise.resolve();
    console.log('[Service Worker] Installationsvorgang erfolgreich abgeschlossen');
  } catch (error) {
    console.error('[Service Worker] Installationsfehler:', error);
  }
});

self.addEventListener('activate', async (event) => {
  console.log('[Service Worker] Activating Service Worker ....', event);

  try {
    await Promise.resolve();
    console.log('[Service Worker] Aktivierungsvorgang erfolgreich abgeschlossen');
  } catch (error) {
    console.error('[Service Worker] Aktivierungsfehler:', error);
  }
});

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
  }
});
