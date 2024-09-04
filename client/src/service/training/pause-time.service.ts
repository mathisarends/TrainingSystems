import { Injectable, Renderer2, RendererFactory2, EventEmitter } from '@angular/core';
import { ExerciseDataDTO } from '../../app/Pages/training-view/exerciseDataDto';
import { ExerciseTableRowService } from './exercise-table-row.service';
import { BrowserCheckService } from '../../app/browser-check.service';
import { ServiceWorkerService } from '../../app/service-worker.service';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  currentSetNotLastSet: boolean = true;
  restartTimerOnDisplayOnlock = false;

  private renderer: Renderer2;
  private keepAliveIntervalId: any; // Store the keep-alive interval ID
  private remainingTime: number = 0; // Store the remaining time
  private initialTime: number = 0;
  countdownEmitter: EventEmitter<number> = new EventEmitter<number>(); // Countdown Emitter

  constructor(
    rendererFactory: RendererFactory2,
    private exerciseTableRowService: ExerciseTableRowService,
    private browserCheckService: BrowserCheckService,
    private serviceWorkerService: ServiceWorkerService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    if (this.browserCheckService.isBrowser()) {
      this.serviceWorkerService.listenForMessages((event: MessageEvent) => {
        if (event.data?.command === 'currentTime') {
          this.handleCurrentTimeUpdate(event.data.currentTime);
        } else if (event.data?.command === 'stopTimerSignal') {
          this.stopTimer();
        }
      });

      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  handleVisibilityChange = () => {
    if (this.currentSetNotLastSet && this.remainingTime === 0 && this.restartTimerOnDisplayOnlock) {
      console.log('timer shall start again');
    }
  };

  // TODO: auch in die DIREKTIVE?
  initializePauseTimers(exerciseData: ExerciseDataDTO) {
    const weightInputs = document.querySelectorAll('.weight') as NodeListOf<HTMLInputElement>;

    weightInputs.forEach((weightInput) => {
      weightInput.addEventListener('change', () => {
        const categoryValue = this.exerciseTableRowService.getExerciseCategorySelectorByElement(weightInput).value;
        const setInput = this.exerciseTableRowService.getSetInputByElement(weightInput);

        const weightValues = this.parseWeightInputValues(weightInput);

        const pauseTime = exerciseData.categoryPauseTimes[categoryValue];
        this.initialTime = pauseTime;
        this.remainingTime = pauseTime;

        if (Number(setInput.value) > weightValues.length) {
          this.currentSetNotLastSet = true;
          this.restartTimerOnDisplayOnlock = true;
        } else {
          this.currentSetNotLastSet = false;
        }

        this.serviceWorkerService.sendMessageToServiceWorker({
          command: 'start',
          duration: pauseTime,
        });
        this.startKeepAlive(); // Start the keep-alive process
      });
    });
  }

  private parseWeightInputValues(weightInput: HTMLInputElement): number[] {
    return weightInput.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
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
  private stopTimer() {
    this.initialTime = 0;
    this.remainingTime = 0;
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
      this.keepAliveIntervalId = null;
    }
    this.countdownEmitter.emit(0);
  }

  private handleCurrentTimeUpdate(currentTime: number) {
    this.remainingTime = currentTime;
    this.countdownEmitter.emit(currentTime); // Emit countdown event for the component
  }

  getCurrentTime(): number {
    return this.remainingTime;
  }

  getInitialTime(): number {
    return this.initialTime;
  }
}
