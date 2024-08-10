self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker ...", event);

  event.waitUntil(
    // Hier könnten Caching-Operationen oder andere Installationsaufgaben hinzugefügt werden
    Promise.resolve()
      .then(() => {
        console.log(
          "[Service Worker] Installationsvorgang erfolgreich abgeschlossen"
        );
        self.skipWaiting(); // Neuen SW sofort benutzen
      })
      .catch((error) => {
        console.error("[Service Worker] Installationsfehler:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker ....", event);

  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log(
          "[Service Worker] Aktivierungsvorgang erfolgreich abgeschlossen"
        );
        return self.clients.claim(); // Übernehme sofort die Kontrolle
      })
      .catch((error) => {
        console.error("[Service Worker] Aktivierungsfehler:", error);
      })
  );
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

      // Formatiere die verbleibende Zeit auf mm:ss
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      let formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      // Zeige die verbleibende Zeit in der Push-Benachrichtigung an
      self.registration.showNotification("TTS", {
        body: `Remaining time: ${formattedTime}`,
        tag: "timer-notification",
      });

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
