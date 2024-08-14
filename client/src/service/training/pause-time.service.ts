import { Injectable, Renderer2, RendererFactory2, EventEmitter, signal, OnInit } from '@angular/core';
import { ExerciseDataDTO } from '../../app/Pages/training-view/exerciseDataDto';
import { ExerciseTableRowService } from './exercise-table-row.service';
import { BrowserCheckService } from '../../app/browser-check.service';

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
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    if (this.browserCheckService.isBrowser() && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.command === 'currentTime') {
          this.handleCurrentTimeUpdate(event.data.currentTime);
        }
      });

      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  // TODO: hier brauchen wir eignetlich logik, dass der nutzer verlässlich auch einen neuen set gemacht hat wie könnte man das identifizieren?
  handleVisibilityChange = () => {
    if (this.currentSetNotLastSet && this.remainingTime === 0 && this.restartTimerOnDisplayOnlock) {
      console.log('timer shall start again');
    }
  };

  // TODO: hier auch das currentSEtNotLastSet setzen wenn der nutzer einfach die erste eingabe macht und es mehr als einen set gibt
  initializePauseTimers(exerciseData: ExerciseDataDTO) {
    const weightInputs = document.querySelectorAll('.weight') as NodeListOf<HTMLInputElement>;

    weightInputs.forEach((weightInput) => {
      weightInput.addEventListener('change', () => {
        const categoryValue = this.exerciseTableRowService.getExerciseCategorySelectorByElement(weightInput).value;
        const setInput = this.exerciseTableRowService.getSetInputByElement(weightInput) as HTMLInputElement;

        const weightValues = this.parseWeightInputValues(weightInput);

        const pauseTime = exerciseData.categoryPauseTimes[categoryValue];
        this.initialTime = pauseTime;
        this.remainingTime = pauseTime;

        if (pauseTime) {
          if (Number(setInput.value) > weightValues.length) {
            this.currentSetNotLastSet = true;
            this.restartTimerOnDisplayOnlock = true;
          } else {
            this.currentSetNotLastSet = false;
          }

          this.notifyServiceWorkerTimerStarted(pauseTime);
          this.startKeepAlive(); // Start the keep-alive process
        } else {
          console.error(`No pause time found for category: ${categoryValue}`);
        }
      });
    });
  }

  /**
   * Parses the weight input field values into an array of numbers,
   * converting commas to dots before parsing to ensure valid float conversion.
   *
   * @param {HTMLInputElement} weightInput The weight input field.
   * @returns {number[]} The parsed weight values.
   */
  private parseWeightInputValues(weightInput: HTMLInputElement): number[] {
    return weightInput.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
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
      console.error('[PauseTimeService] Service Worker not available or not registered.');
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
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller && this.remainingTime > 0) {
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
