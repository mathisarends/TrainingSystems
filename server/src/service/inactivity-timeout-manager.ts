export class InactivityTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly timeoutDuration: number;
  private onTimeoutCallback: () => void;

  constructor(timeoutDuration: number, onTimeoutCallback: () => void) {
    this.timeoutDuration = timeoutDuration;
    this.onTimeoutCallback = onTimeoutCallback;
  }

  startTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(this.onTimeoutCallback, this.timeoutDuration);
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
