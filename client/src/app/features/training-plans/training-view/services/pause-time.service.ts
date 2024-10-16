import { effect, Injectable, Injector, signal } from '@angular/core';
import { HttpService } from '../../../../core/services/http-client.service';
import { ServiceWorkerService } from '../../../../platform/service-worker.service';
import { DeviceLockService } from './lock-timer.service';
import { WakeLockService } from './wake-lock.service';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private keepAliveIntervalId: any;

  private initialTime: number = 0;

  remainingTime = signal(0);

  currentExercise = signal('');

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private deviceLockService: DeviceLockService,
    private httpService: HttpService,
    private wakeLockService: WakeLockService,
    private injector: Injector,
  ) {
    this.restoreStateFromLocalStorage();

    effect(
      () => {
        if (this.deviceLockService.isDeviceLocked()) {
          console.log('gets locked');
          this.saveTimerStateOnDisplayLock();
        } else {
          console.log('gets unlocked');
          this.restoreTimerOnDisplayUnlock();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );

    this.serviceWorkerService.listenForMessages((event: MessageEvent) => {
      if (event.data.command === 'currentTime') {
        this.remainingTime.set(event.data.currentTime);
      } else if (event.data.command === 'stopTimerSignal') {
        this.remainingTime.set(0);
      }
    });

    effect(
      () => {
        if (this.remainingTime() === 0 && this.initialTime !== 0) {
          clearInterval(this.keepAliveIntervalId);
          this.keepAliveIntervalId = null;

          new Audio('./audio/boxing_bell.mp3').play();
          localStorage.removeItem('initialTime');

          this.stopKeepAliveOnServer();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  private saveTimerStateOnDisplayLock() {
    const timestamp = Date.now();
    localStorage.setItem('lockTimestamp', timestamp.toString());
    localStorage.setItem('remainingTimeBeforeLock', this.remainingTime().toString());

    console.log('Speichere Zeitstempel und verbleibende Zeit im Local Storage.');
  }

  private restoreTimerOnDisplayUnlock() {
    const lockTimestamp = localStorage.getItem('lockTimestamp');
    const remainingTimeBeforeLock = localStorage.getItem('remainingTimeBeforeLock');

    if (lockTimestamp && remainingTimeBeforeLock) {
      const parsedTimestamp = parseInt(lockTimestamp, 10);
      const parsedRemainingTime = parseInt(remainingTimeBeforeLock, 10);

      const now = Date.now();
      const timePassed = Math.floor((now - parsedTimestamp) / 1000);

      const newRemainingTime = Math.max(0, parsedRemainingTime - timePassed);

      console.log(`Verstrichene Zeit: ${timePassed} Sekunden, neue verbleibende Zeit: ${newRemainingTime} Sekunden`);

      this.serviceWorkerService.sendMessageToServiceWorker({
        command: 'setTime',
        newRemainingTime,
      });
      localStorage.removeItem('lockTimestamp');
      localStorage.removeItem('remainingTimeBeforeLock');
    }
  }

  /**
   * Starts the pause timer with the given duration.
   * Sends a message to the service worker and starts the keep-alive interval.
   */
  async startPauseTimer(pauseTime: number, exerciseName: string): Promise<void> {
    await this.wakeLockService.requestWakeLock();

    this.initialTime = pauseTime;
    this.remainingTime.set(pauseTime);

    localStorage.setItem('currentExercise', exerciseName);
    localStorage.setItem('initialTime', pauseTime.toString());

    this.startKeepAliveOnServer();

    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'start',
      duration: pauseTime,
    });

    this.currentExercise.set(exerciseName);
  }

  adjustTime(seconds: number): void {
    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'adjustTime',
      seconds,
    });
  }

  skipTimer() {
    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'stop',
    });
  }

  getInitialTime(): number {
    return this.initialTime;
  }

  private restoreStateFromLocalStorage(): void {
    const savedExercise = localStorage.getItem('currentExercise');
    const savedInitialTime = localStorage.getItem('initialTime');

    if (savedExercise) {
      this.currentExercise.set(savedExercise);
    }

    if (savedInitialTime) {
      this.initialTime = parseInt(savedInitialTime, 10);
      this.remainingTime.set(this.initialTime);
    }
  }

  private startKeepAliveOnServer() {
    this.httpService.post('/rest-pause-timer/keep-alive').subscribe((response) => {});
  }

  private stopKeepAliveOnServer() {
    this.httpService.post('/rest-pause-timer/stop-keep-alive').subscribe(() => {});
  }
}
