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
    let remainingTime = seconds;

    const intervalId = setInterval(() => {
      if (remainingTime > 0) {
        console.log(
          '🚀 ~ PauseTimeService ~ intervalId ~ remainingTime:',
          remainingTime
        );
        this.countdownEmitter.emit(remainingTime);
        remainingTime--;
      } else {
        clearInterval(intervalId);
        this.countdownEmitter.emit(0);
        console.log('Countdown finished');
      }
    }, 1000);
  }
}
