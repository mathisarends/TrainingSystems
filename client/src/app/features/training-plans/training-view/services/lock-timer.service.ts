import { Injectable, signal } from '@angular/core';
import { PauseTimeService } from './pause-time.service';

@Injectable({
  providedIn: 'root',
})
export class LockTimerService {
  private isDeviceLockedSignal = signal<boolean>(document.hidden);

  constructor(private pauseTimeService: PauseTimeService) {
    document.addEventListener('visibilitychange', () => {
      this.updateLockStatus();
    });
  }

  private updateLockStatus() {
    if (document.hidden) {
      this.storeStateInLocalStorage();
    } else {
      this.restoreStateFromLocalStorage();
    }
    this.isDeviceLockedSignal.set(document.hidden);
  }

  private storeStateInLocalStorage() {
    const timestamp = Date.now();
    const remainingTime = this.pauseTimeService.remainingTime();

    localStorage.setItem('lockTimestamp', timestamp.toString());
    localStorage.setItem('remainingTimeBeforeLock', remainingTime.toString());

    console.log('Speichere Zeitstempel und verbleibende Zeit im Local Storage.');
  }

  private restoreStateFromLocalStorage() {
    const lockTimestamp = localStorage.getItem('lockTimestamp');
    const remainingTimeBeforeLock = localStorage.getItem('remainingTimeBeforeLock');

    if (lockTimestamp && remainingTimeBeforeLock) {
      const now = Date.now();
      const timePassed = Math.floor((now - parseInt(lockTimestamp, 10)) / 1000);

      const newRemainingTime = Math.max(0, parseInt(remainingTimeBeforeLock, 10) - timePassed);
      this.pauseTimeService.remainingTime.set(newRemainingTime);

      console.log(`Verstrichene Zeit: ${timePassed} Sekunden, neue verbleibende Zeit: ${newRemainingTime} Sekunden`);

      localStorage.removeItem('lockTimestamp');
      localStorage.removeItem('remainingTimeBeforeLock');
    }
  }
}
