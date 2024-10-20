export class InactivityTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private timeoutDuration: number;
  private onTimeoutCallback: () => void | Promise<void>;

  constructor(
    timeoutDuration: number,
    onTimeoutCallback: () => void | Promise<void>,
  ) {
    this.timeoutDuration = timeoutDuration;
    this.onTimeoutCallback = onTimeoutCallback;
  }

  startTimeout(): void {
    this.clearTimeout();

    this.timeoutId = setTimeout(async () => {
      try {
        await this.onTimeoutCallback();
        console.log('went thortugh');
      } catch (error) {
        console.error('Error in onTimeoutCallback:', error);
      }
    }, this.timeoutDuration);
  }

  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  resetTimeout(): void {
    this.startTimeout();
  }
}
