import { Injectable, Renderer2, RendererFactory2, EventEmitter } from '@angular/core';
import { ServiceWorkerService } from '../../app/platform/service-worker.service';

@Injectable({
  providedIn: 'root',
})
export class PauseTimeService {
  restartTimerOnDisplayOnlock = false;

  private renderer: Renderer2;
  private keepAliveIntervalId: any; // Store the keep-alive interval ID
  private remainingTime: number = 0; // Store the remaining time
  private initialTime: number = 0;
  countdownEmitter: EventEmitter<number> = new EventEmitter<number>(); // Countdown Emitter

  constructor(
    rendererFactory: RendererFactory2,
    private serviceWorkerService: ServiceWorkerService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Message handling from the service worker
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
  startPauseTimer(pauseTime: number): void {
    this.initialTime = pauseTime;
    this.remainingTime = pauseTime;

    this.serviceWorkerService.sendMessageToServiceWorker({
      command: 'start',
      duration: pauseTime,
    });

    this.startKeepAlive(); // Start the keep-alive process
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
    }, 10000); // Send keep-alive every 10 seconds
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
    this.countdownEmitter.emit(0); // Emit 0 when the timer stops
  }

  private handleCurrentTimeUpdate(currentTime: number): void {
    this.remainingTime = currentTime;
    this.countdownEmitter.emit(currentTime); // Emit the updated current time
  }

  getCurrentTime(): number {
    return this.remainingTime;
  }

  getInitialTime(): number {
    return this.initialTime;
  }
}
