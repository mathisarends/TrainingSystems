import { Injectable } from '@angular/core';

/**
 * The WakeLockService is responsible for interacting with the Wake Lock API to prevent
 * the device's screen from turning off or the device from entering sleep mode while the
 * application is running and visible.
 */
@Injectable({
  providedIn: 'root',
})
export class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.requestWakeLock();
      } else {
        this.releaseWakeLock();
      }
    });
  }

  async requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      console.error('Wake Lock API is not supported by this browser.');
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to request wake lock: ${error.name}, ${error.message}`);
    }
  }

  async releaseWakeLock() {
    if (!this.wakeLock) {
      return;
    }

    try {
      await this.wakeLock.release();
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Failed to release wake lock: ${error.name}, ${error.message}`);
    } finally {
      this.wakeLock = null;
    }
  }
}
