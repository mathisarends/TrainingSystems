import {
  EventEmitter,
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { ExerciseDataDTO } from '../../app/Pages/training-view/exerciseDataDto';
import { NotificationService } from '../../app/notification.service';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private renderer: Renderer2;
  countdownEmitter: EventEmitter<number> = new EventEmitter<number>();
  private remainingTime: number = 0; // Store the remaining time
  private initialTime: number = 0;

  private intervalId: any; // Store the interval ID
  countdownRunning = false;

  constructor(
    rendererFactory: RendererFactory2,
    private notificationService: NotificationService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initializePauseTimers(exerciseData: ExerciseDataDTO) {
    const weightInputs = document.querySelectorAll(
      '.weight'
    ) as NodeListOf<HTMLInputElement>;

    weightInputs.forEach((weightInput) => {
      weightInput.addEventListener('change', () => {
        const closestCategorySelector = weightInput
          .closest('tr')
          ?.querySelector('.exercise-category-selector') as HTMLSelectElement;

        if (closestCategorySelector) {
          const categoryValue = closestCategorySelector.value;

          const pauseTime = exerciseData.categoryPauseTimes[categoryValue];
          this.initialTime = pauseTime;

          if (pauseTime) {
            this.startCountdown(pauseTime);
            this.notifyServiceWorkerTimerStarted(pauseTime);
          } else {
            console.error(`No pause time found for category: ${categoryValue}`);
          }
        }
      });
    });
  }

  /**
   * Benachrichtigt den Service Worker, dass ein Timer gestartet wurde.
   * @param remainingTime - Die verbleibende Zeit in Sekunden.
   */
  private notifyServiceWorkerTimerStarted(remainingTime: number) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TIMER_STARTED',
        remainingTime: remainingTime,
      });
      console.log(
        `[PauseTimeService] Notified Service Worker: Timer started with ${remainingTime} seconds remaining.`
      );
    } else {
      console.error(
        '[PauseTimeService] Service Worker not available or not registered.'
      );
    }
  }

  /**
   * Starts a countdown and emits the remaining time every second.
   * @param seconds - The total number of seconds for the countdown.
   */
  private startCountdown(seconds: number) {
    if (this.countdownRunning && this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.countdownRunning = true;
    this.remainingTime = seconds; // Initialize remaining time
    this.countdownEmitter.emit(this.remainingTime); // Emit immediately
    this.notificationService.sendNotification(
      'Timer Update',
      this.formatTime(this.remainingTime)
    );

    this.intervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.countdownEmitter.emit(this.remainingTime);
        this.notificationService.sendNotification(
          'Timer Update',
          this.formatTime(this.remainingTime)
        );
      } else {
        clearInterval(this.intervalId);
        this.countdownRunning = false;
        this.countdownEmitter.emit(0);
        this.notificationService.sendNotification(
          'Timer Update',
          'Countdown finished'
        );
        console.log('Countdown finished');
      }
    }, 1000);
  }

  /**
   * Adjust the remaining time by the specified number of seconds.
   * @param seconds - The number of seconds to adjust the timer by.
   */
  adjustTime(seconds: number) {
    this.remainingTime = Math.max(this.remainingTime + seconds, 0);
    this.countdownEmitter.emit(this.remainingTime);
  }

  /**
   * Skip the timer by setting the remaining time to 0.
   */
  skipTimer() {
    this.remainingTime = 0;
    clearInterval(this.intervalId);
    this.countdownRunning = false;
    this.countdownEmitter.emit(this.remainingTime);
    console.log('Timer skipped');
  }

  /**
   * Get the current remaining time.
   */
  getCurrentTime(): number {
    return this.remainingTime;
  }

  /**
   * Get the initial time set for the timer.
   */
  getInitialTime(): number {
    return this.initialTime;
  }

  private formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const secs: number = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(secs)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}
