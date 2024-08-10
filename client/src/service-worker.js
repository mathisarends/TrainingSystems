self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker ...", event);
  self.skipWaiting(); // Neuen sw benutzne
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker ....", event);
  return self.clients.claim();
});

let remainingTime = 0;
let timer;
let isTimerPaused = false;
let pausedTime = 0;

self.addEventListener("message", function (event) {
  const data = event.data;

  switch (data.command) {
    case "start":
      startTimer(data.duration);
      break;
    case "stop":
      stopTimer();
      closeNotifications();
      break;
    case "pauseTimer":
      pauseTimer();
      break;
    case "continueTimer":
      continueTimer();
      break;
    case "keepAlive":
      if (!isTimerPaused) {
        restartRestPauseTimer(data.duration - 1); // 1 Sekunde direkt abziehen
      }
      break;
    case "adjustTime":
      remainingTime += data.seconds;
      break;
  }
});

function restartRestPauseTimer(newDuration) {
  clearInterval(timer);
  remainingTime = newDuration;
  startTimer(newDuration);
}

function startTimer(duration) {
  remainingTime = duration;

  if (timer) {
    clearInterval(timer); // Wenn bereits ein Timer läuft, stoppe ihn
  }

  // Direkte Aktualisierung der Timer-Anzeige beim Start
  updateTimerDisplay(remainingTime);

  timer = setInterval(function () {
    if (remainingTime <= 0) {
      clearInterval(timer);
      notifyTimerExpired();
    } else {
      remainingTime--;

      // Sende die verbleibende Zeit in Sekunden an die Frontend-Anwendung
      updateTimerDisplay(remainingTime);
    }
  }, 1000);
}

function updateTimerDisplay(time) {
  // Aktualisiere die Timer-Anzeige in der Benutzeroberfläche
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        command: "currentTime",
        currentTime: time,
      });
    });
  });
}

function notifyTimerExpired() {
  // Sende Push-Benachrichtigung an den Client, dass der Timer abgelaufen ist
  self.registration.showNotification("TTS", {
    body: "Your timer has expired!",
    tag: "timer-notification",
    vibrate: [200, 100, 200],
  });
}

function stopTimer() {
  clearInterval(timer);
  remainingTime = 0;
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    pausedTime = remainingTime;
    isTimerPaused = true;
  }
}

function continueTimer() {
  if (isTimerPaused) {
    startTimer(pausedTime);
    isTimerPaused = false;
  }
}

function closeNotifications() {
  // Schließt alle Timer-Benachrichtigungen
  self.registration
    .getNotifications({ tag: "timer-notification" })
    .then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
    });
}
