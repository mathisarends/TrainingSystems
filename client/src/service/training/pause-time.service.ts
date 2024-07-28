import {
  EventEmitter,
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { ExerciseDataDTO } from '../../app/Pages/training-view/exerciseDataDto';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private renderer: Renderer2;
  countdownEmitter: EventEmitter<number> = new EventEmitter<number>();
  private remainingTime: number = 0; // Store the remaining time
  private intervalId: any; // Store the interval ID
  countdownRunning = false;

  constructor(rendererFactory: RendererFactory2) {
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

          if (pauseTime) {
            this.startCountdown(pauseTime);
          } else {
            console.error(`No pause time found for category: ${categoryValue}`);
          }
        }
      });
    });
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

    this.intervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.countdownEmitter.emit(this.remainingTime);
      } else {
        clearInterval(this.intervalId);
        this.countdownRunning = false;
        this.countdownEmitter.emit(0);
        console.log('Countdown finished');
      }
    }, 1000);
  }

  /**
   * Get the current remaining time.
   */
  getCurrentTime(): number {
    return this.remainingTime;
  }
}
