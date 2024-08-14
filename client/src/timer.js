class Timer {
  constructor(notificationManager) {
    this.remainingTime = 0;
    this.timer = null;
    this.isTimerPaused = false;
    this.pausedTime = 0;
    this.notificationManager = notificationManager; // Use the passed NotificationManager instance
  }

  startTimer(duration) {
    this.remainingTime = duration;

    if (this.timer) {
      clearInterval(this.timer); // Stop any existing timer
    }

    this.updateTimerDisplay(this.remainingTime);

    this.timer = setInterval(() => {
      if (this.remainingTime <= 0) {
        clearInterval(this.timer);
        this.notifyTimerExpired();
      } else {
        this.remainingTime--;

        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        let formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        this.notificationManager.showNotification('TTS', `Remaining time: ${formattedTime}`);

        this.updateTimerDisplay(this.remainingTime);
      }
    }, 1000);
  }

  updateTimerDisplay(time) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          command: 'currentTime',
          currentTime: time,
        });
      });
    });
  }

  notifyTimerExpired() {
    this.notificationManager.showNotification('TTS', 'Your timer has expired!', {
      vibrate: [200, 100, 200],
    });
  }

  stopTimer() {
    clearInterval(this.timer);
    this.remainingTime = 0;
  }

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.pausedTime = this.remainingTime;
      this.isTimerPaused = true;
    }
  }

  continueTimer() {
    if (this.isTimerPaused) {
      this.startTimer(this.pausedTime);
      this.isTimerPaused = false;
    }
  }

  restartRestPauseTimer(newDuration) {
    clearInterval(this.timer);
    this.remainingTime = newDuration;
    this.startTimer(newDuration);
  }

  closeNotifications() {
    this.notificationManager.closeNotifications();
  }
}

self.Timer = Timer;
