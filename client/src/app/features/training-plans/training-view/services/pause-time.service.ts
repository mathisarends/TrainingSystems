import { effect, Injectable, Injector, signal } from '@angular/core';
import { HttpService } from '../../../../core/services/http-client.service';
import { ServiceWorkerService } from '../../../../platform/service-worker.service';
import { WakeLockService } from './wake-lock.service';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private keepAliveIntervalId: any = null;
  private initialTime: number = 0;

  remainingTime = signal(0);
  currentExercise = signal('');

  constructor(
    private serviceWorkerService: ServiceWorkerService,
    private httpService: HttpService,
    private wakeLockService: WakeLockService,
    private injector: Injector,
  ) {
    this.initializeService();
  }

  /**
   * Initializes the service by restoring state and setting up listeners.
   */
  private initializeService(): void {
    this.restoreStateFromLocalStorage();
    this.setupListeners();
    this.setupTimerExpiredEffect();
  }

  /**
   * Starts the pause timer with the given duration.
   */
  async startPauseTimer(pauseTime: number, exerciseName: string): Promise<void> {
    await this.wakeLockService.requestWakeLock();

    this.initialTime = pauseTime;
    this.remainingTime.set(pauseTime);

    this.persistStateToLocalStorage(exerciseName, pauseTime);
    this.startKeepAliveOnServer();

    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'start',
      duration: pauseTime,
    });

    this.currentExercise.set(exerciseName);
  }

  /**
   * Adjusts the remaining time in the pause timer.
   */
  adjustTime(seconds: number): void {
    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'adjustTime',
      seconds,
    });
  }

  /**
   * Skips the timer.
   */
  skipTimer(): void {
    this.serviceWorkerService.sendMessageToServiceWorker({ command: 'stop' });
  }

  /**
   * Retrieves the initial time for the pause timer.
   */
  getInitialTime(): number {
    return this.initialTime;
  }

  /**
   * Sets up event listeners and service worker message listeners.
   */
  private setupListeners(): void {
    window.addEventListener('beforeunload', this.stopKeepAliveOnServer.bind(this));

    this.serviceWorkerService.listenForMessages((event: MessageEvent) => {
      if (event.data.command === 'currentTime') {
        this.remainingTime.set(event.data.currentTime);
      } else if (event.data.command === 'stopTimerSignal') {
        this.remainingTime.set(0);
      }
    });
  }

  /**
   * Sets up an effect to monitor remaining time and stop the timer when it reaches zero.
   */
  private setupTimerExpiredEffect(): void {
    effect(
      () => {
        if (this.remainingTime() === 0 && this.initialTime !== 0) {
          this.clearKeepAlive();
          new Audio('./audio/boxing_bell.mp3').play();
          localStorage.removeItem('initialTime');
          this.stopKeepAliveOnServer();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Restores the state of the pause timer from local storage.
   */
  private restoreStateFromLocalStorage(): void {
    const savedExercise = localStorage.getItem('currentExercise') || '';
    const savedInitialTime = Number(localStorage.getItem('initialTime') || '0');

    this.currentExercise.set(savedExercise);
    this.initialTime = savedInitialTime;
    this.remainingTime.set(this.initialTime);
  }

  /**
   * Persists the state of the pause timer to local storage.
   */
  private persistStateToLocalStorage(exerciseName: string, pauseTime: number): void {
    localStorage.setItem('currentExercise', exerciseName);
    localStorage.setItem('initialTime', pauseTime.toString());
  }

  /**
   * Starts the server keep-alive.
   */
  private startKeepAliveOnServer(): void {
    this.httpService.post('/training-timer').subscribe();
  }

  /**
   * Stops the server keep-alive.
   */
  private stopKeepAliveOnServer(): void {
    this.httpService.delete('/training-timer').subscribe();
  }

  /**
   * Clears the keep-alive interval.
   */
  private clearKeepAlive(): void {
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
      this.keepAliveIntervalId = null;
    }
  }
}
