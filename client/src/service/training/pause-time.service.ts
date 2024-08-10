import {
  Injectable,
  Renderer2,
  RendererFactory2,
  EventEmitter,
} from '@angular/core';
import { ExerciseDataDTO } from '../../app/Pages/training-view/exerciseDataDto';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private renderer: Renderer2;
  private keepAliveIntervalId: any; // Store the keep-alive interval ID
  private remainingTime: number = 0; // Store the remaining time
  private initialTime: number = 0;
  countdownEmitter: EventEmitter<number> = new EventEmitter<number>(); // Countdown Emitter

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Event Listener für Nachrichten vom Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.command === 'currentTime') {
          this.handleCurrentTimeUpdate(event.data.currentTime);
        }
      });
    }
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
          this.remainingTime = pauseTime;

          if (pauseTime) {
            this.notifyServiceWorkerTimerStarted(pauseTime);
            this.startKeepAlive(); // Start the keep-alive process
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
        command: 'start',
        duration: remainingTime,
      });
    } else {
      console.error(
        '[PauseTimeService] Service Worker not available or not registered.'
      );
    }
  }

  /**
   * Starts the keep-alive process, sending a message to the Service Worker every 10 seconds.
   */
  private startKeepAlive() {
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
    }

    this.keepAliveIntervalId = setInterval(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          command: 'keepAlive',
          duration: this.remainingTime,
        });
      }
    }, 10000); // 10 Sekunden Interval
  }

  /**
   * Handles the current time update received from the Service Worker.
   * @param currentTime - The current time sent from the Service Worker.
   */
  private handleCurrentTimeUpdate(currentTime: number) {
    this.remainingTime = currentTime;
    this.countdownEmitter.emit(currentTime); // Emit countdown event for the component
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
    return this.initialTime; // Assuming initial time is the same as remaining time at the start
  }
}
