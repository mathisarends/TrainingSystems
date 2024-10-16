import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceLockService {
  private isDeviceLockedSignal: WritableSignal<boolean> = signal(false);

  constructor() {
    document.addEventListener('visibilitychange', () => {
      this.updateLockStatus();
    });
  }

  private updateLockStatus() {
    this.isDeviceLockedSignal.set(document.hidden);
  }

  get isDeviceLocked() {
    return this.isDeviceLockedSignal.asReadonly();
  }
}
