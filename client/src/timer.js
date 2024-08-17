/**
 * @class Timer
 * @classdesc This class manages a countdown timer, allowing it to start, pause, continue, and stop,
 * while displaying notifications when the timer updates or expires.
 */
class Timer {
  constructor(notificationManager) {
    this.remainingTime = 0;
    this.timer = null;
    this.isTimerPaused = false;
    this.pausedTime = 0;
    this.notificationManager = notificationManager; // Use the passed NotificationManager instance
  }

  /**
   * Starts the timer for the specified duration.
   *
   * @param {number} duration - The duration of the timer in seconds.
   */
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

  /**
   * Updates the display of the timer by sending the current time to all clients.
   *
   * @param {number} time - The current time to be displayed, in seconds.
   */
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

  /**
   * Notifies the user that the timer has expired by displaying a notification.
   */
  notifyTimerExpired() {
    this.notificationManager.showNotification('TTS', 'Your timer has expired!', {
      vibrate: [200, 100, 200],
    });
  }

  /**
   * Stops the timer and resets the remaining time to zero.
   */
  stopTimer() {
    clearInterval(this.timer);
    this.remainingTime = 0;
  }

  /**
   * Pauses the timer, saving the remaining time for later continuation.
   */
  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.pausedTime = this.remainingTime;
      this.isTimerPaused = true;
    }
  }

  /**
   * Continues the timer from where it was paused.
   */
  continueTimer() {
    if (this.isTimerPaused) {
      this.startTimer(this.pausedTime);
      this.isTimerPaused = false;
    }
  }

  /**
   * Restarts the timer with a new duration, typically used after a rest or pause period.
   *
   * @param {number} newDuration - The new duration for the timer in seconds.
   */
  restartRestPauseTimer(newDuration) {
    clearInterval(this.timer);
    this.remainingTime = newDuration;
    this.startTimer(newDuration);
  }

  /**
   * Closes all notifications associated with this timer.
   */
  closeNotifications() {
    this.notificationManager.closeNotifications();
  }
}

self.Timer = Timer;
