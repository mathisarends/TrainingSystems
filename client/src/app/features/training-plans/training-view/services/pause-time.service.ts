import { effect, Injectable, Injector, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BrowserCheckService } from '../../../../core/services/browser-check.service';
import { HttpService } from '../../../../core/services/http-client.service';
import { ServiceWorkerService } from '../../../../platform/service-worker.service';
import { BasicConfirmationResponse } from '../../../../shared/dto/basic-confirmation-response';

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
    private browserCheckService: BrowserCheckService,
    private httpService: HttpService,
    private injector: Injector,
  ) {
    if (this.browserCheckService.isBrowser()) {
      this.restoreStateFromLocalStorage();
    }

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
          this.clearLocalStorage();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Starts the pause timer with the given duration.
   * Sends a message to the service worker and starts the keep-alive interval.
   */
  startPauseTimer(pauseTime: number, exerciseName: string): void {
    this.initialTime = pauseTime;
    this.remainingTime.set(pauseTime);

    this.saveExerciseNameInLocalStorage(exerciseName);
    this.saveInitialTimeInLocalStorage(pauseTime);

    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'start',
      duration: pauseTime,
    });

    this.currentExercise.set(exerciseName);
    this.startKeepAlive();

    this.startKeepAliveOnServer(pauseTime).subscribe((response) => {
      console.log('🚀 ~ PauseTimeService ~ this.startKeepAliveOnServer ~ response:', response);
    });
  }

  private startKeepAlive() {
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
    }

    this.keepAliveIntervalId = setInterval(() => {
      if (this.remainingTime() > 0) {
        this.serviceWorkerService.sendMessageToServiceWorker({
          command: 'keepAlive',
          duration: this.remainingTime(),
        });
      }
    }, 10000);
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

      if (this.remainingTime() > 0) {
        this.startKeepAlive();
      }
    }
  }

  private startKeepAliveOnServer(pauseTime: number): Observable<BasicConfirmationResponse> {
    return this.httpService.post('/rest-pause-timer', { pauseTime });
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
