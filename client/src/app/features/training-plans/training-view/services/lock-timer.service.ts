import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceLockService {
  private isDeviceLockedSignal: WritableSignal<boolean> = signal(false);

  constructor() {
    document.addEventListener('visibilitychange', () => {
      this.updateLockStatus();
      console.log('Document visibility changed. Current visibility state:', document.hidden);
    });

    console.log('DeviceLockService initialized and listening for visibility changes.');
  }

  private updateLockStatus() {
    this.isDeviceLockedSignal.set(document.hidden);
  }

  get isDeviceLocked() {
    return this.isDeviceLockedSignal.asReadonly();
  }
}
