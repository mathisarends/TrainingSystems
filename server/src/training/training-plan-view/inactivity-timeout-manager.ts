/**
 * Manages an inactivity timeout, allowing actions to be triggered after a specified duration of inactivity.
 * Provides functionality to start, reset, or clear the timeout as needed.
 */
export class InactivityTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private timeoutDuration: number;
  private onTimeoutCallback: () => void | Promise<void>;

  /**
   * Creates an instance of InactivityTimeoutManager.
   * @param timeoutDuration The duration (in milliseconds) after which the timeout is triggered.
   * @param onTimeoutCallback The callback to execute when the timeout is triggered.
   */
  constructor(timeoutDuration: number, onTimeoutCallback: () => void | Promise<void>) {
    this.timeoutDuration = timeoutDuration;
    this.onTimeoutCallback = onTimeoutCallback;
  }

  /**
   * Starts the inactivity timeout. If a timeout is already running, it is cleared before starting a new one.
   * The provided callback is executed once the timeout duration is reached.
   */
  startTimeout(): void {
    this.clearTimeout();

    this.timeoutId = setTimeout(async () => {
      try {
        await this.onTimeoutCallback();
      } catch (error) {
        console.error('Error in onTimeoutCallback:', error);
      }
    }, this.timeoutDuration);
  }

  /**
   * Clears the currently running timeout, if any, preventing the callback from being executed.
   */
  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Resets the inactivity timeout by clearing the current timeout (if any) and starting a new one.
   */
  resetTimeout(): void {
    this.startTimeout();
  }
}
