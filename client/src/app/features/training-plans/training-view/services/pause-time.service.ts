import { EventEmitter, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';
import { BrowserCheckService } from '../../../../core/services/browser-check.service';
import { ServiceWorkerService } from '../../../../platform/service-worker.service';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private renderer: Renderer2;
  private keepAliveIntervalId: any; // Store the keep-alive interval ID

  private initialTime: number = 0;

  remainingTime: number = 0; // Store the remaining time

  currentExercise = signal('');

  countdownEmitter: EventEmitter<number> = new EventEmitter<number>(); // Countdown Emitter

  constructor(
    rendererFactory: RendererFactory2,
    private serviceWorkerService: ServiceWorkerService,
    private browserCheckService: BrowserCheckService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    if (this.browserCheckService.isBrowser()) {
      this.restoreStateFromLocalStorage();
    }

    this.serviceWorkerService.listenForMessages((event: MessageEvent) => {
      if (event.data.command === 'currentTime') {
        this.handleCurrentTimeUpdate(event.data.currentTime);
      } else if (event.data?.command === 'stopTimerSignal') {
        this.stopTimer();
      }
    });
  }

  /**
   * Starts the pause timer with the given duration.
   * Sends a message to the service worker and starts the keep-alive interval.
   */
  startPauseTimer(pauseTime: number, exerciseName: string): void {
    this.initialTime = pauseTime;
    this.remainingTime = pauseTime;

    this.saveExerciseNameInLocalStorage(exerciseName);
    this.saveInitialTimeInLocalStorage(pauseTime);

    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'start',
      duration: pauseTime,
    });

    this.currentExercise.set(exerciseName);

    this.startKeepAlive();
  }

  private startKeepAlive() {
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
    }

    this.keepAliveIntervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.serviceWorkerService.sendMessageToServiceWorker({
          command: 'keepAlive',
          duration: this.remainingTime,
        });
      }
    }, 10000); 
  }

  /**
   * Stops the timer by resetting remaining time, clearing the interval, and emitting a final event.
   */
  private stopTimer(): void {
    this.initialTime = 0;
    this.remainingTime = 0;
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
      this.keepAliveIntervalId = null;
    }

    this.clearLocalStorage();

    this.countdownEmitter.emit(0);
  }

  private handleCurrentTimeUpdate(currentTime: number): void {
    this.remainingTime = currentTime;

    if (currentTime === 0) {
      this.clearLocalStorage();
    }

    this.countdownEmitter.emit(currentTime); // Emit the updated current time
  }

  getCurrentTime(): number {
    return this.remainingTime;
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
      this.remainingTime = this.initialTime;

      if (this.remainingTime > 0) {
        this.startKeepAlive();
        this.countdownEmitter.emit(this.remainingTime);
      }
    }
  }

  /**
   * Clears the exercise name and initial time from localStorage.
   */
  private clearLocalStorage(): void {
    localStorage.removeItem('initialTime');
  }

  private saveExerciseNameInLocalStorage(exerciseName: string): void {
    localStorage.setItem('currentExercise', exerciseName);
  }

  private saveInitialTimeInLocalStorage(exercisePauseTime: number): void {
    localStorage.setItem('initialTime', exercisePauseTime.toString());
  }
}
