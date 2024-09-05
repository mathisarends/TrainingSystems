import { Injectable, signal, WritableSignal } from '@angular/core';
import { BrowserCheckService } from '../app/browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class MobileDeviceDetectionService {
  private readonly isMobileSignal!: WritableSignal<boolean>;

  /**
   * Initializes the service and sets up a listener for window resize events to update
   * the mobile view state.
   *
   * @param browserCheckService - Service to check if the code is running in a browser environment.
   */
  constructor(private browserCheckService: BrowserCheckService) {
    if (this.browserCheckService.isBrowser()) {
      this.isMobileSignal = signal(this.checkForMobileDevice());

      window.addEventListener('resize', () => {
        this.isMobileSignal.set(this.checkForMobileDevice());
      });
    }
  }

  /**
   * Gets the current mobile view state.
   *
   * @returns `true` if the view is on a mobile device, `false` otherwise.
   */
  get isMobileDevice(): boolean {
    return this.isMobileSignal();
  }

  /**
   * Checks if the current view width indicates a mobile device.
   *
   * @returns `true` if the window width is 768 pixels or less, `false` otherwise.
   */
  private checkForMobileDevice(): boolean {
    const userAgentCheck = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const widthCheck = window.innerWidth <= 768;

    return userAgentCheck || (touchCheck && widthCheck);
  }
}
