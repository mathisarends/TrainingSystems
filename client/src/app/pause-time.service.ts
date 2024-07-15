import {
  Injectable,
  Renderer2,
  RendererFactory2,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  private renderer: Renderer2;
  private isBrowser: boolean;
  private timerInterval: any;
  private remainingTime: number = 0;
  private isPaused: boolean = false;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  initializePauseTimers(categoryPauseTimes: { [key: string]: number }) {
    if (!this.isBrowser) {
      return;
    }

    const weightInputs = document.querySelectorAll(
      '.weight'
    ) as NodeListOf<HTMLInputElement>;

    weightInputs.forEach((weightInput) => {
      this.renderer.listen(weightInput, 'change', (e) => {
        const parentRow = weightInput.closest('tr');
        const categorySelector = parentRow?.querySelector(
          '.exercise-category-selector'
        ) as HTMLSelectElement;
        const category = categorySelector?.value;

        if (category && categoryPauseTimes[category]) {
          const pauseTime = categoryPauseTimes[category];
          console.log(
            `Category: ${category}, Pause Time: ${pauseTime} seconds`
          );

          // Trigger the pause timer
          this.triggerPauseTimer(pauseTime);
        } else {
          console.log(
            `Category not found or no pause time set for: ${category}`
          );
        }
      });
    });
  }

  triggerPauseTimer(pauseTime: number) {
    console.log(`Pause timer started for ${pauseTime} seconds`);
    this.remainingTime = pauseTime;
    this.isPaused = false;

    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.remainingTime -= 1;
        console.log(`Time left: ${this.remainingTime} seconds`);

        if (this.remainingTime <= 0) {
          clearInterval(this.timerInterval);
          console.log('Pause time is over');
        }
      }
    }, 1000);
  }

  pauseTimer() {
    this.isPaused = !this.isPaused;
    console.log(`Timer is now ${this.isPaused ? 'paused' : 'resumed'}`);
  }

  extendPauseTime(seconds: number) {
    this.remainingTime += seconds;
    console.log(
      `Pause time extended by ${seconds} seconds. New time: ${this.remainingTime} seconds`
    );
  }
}
