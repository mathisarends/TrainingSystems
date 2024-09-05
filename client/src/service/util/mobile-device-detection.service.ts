import { Injectable, signal, WritableSignal } from '@angular/core';
import { BrowserCheckService } from '../../app/browser-check.service';

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
      this.isMobileSignal = signal(this.checkIsMobileView());

      window.addEventListener('resize', () => {
        this.isMobileSignal.set(this.checkIsMobileView());
      });
    }
  }

  /**
   * Gets the current mobile view state.
   *
   * @returns `true` if the view is on a mobile device, `false` otherwise.
   */
  get isMobileView(): boolean {
    return this.isMobileSignal();
  }

  /**
   * Checks if the current view width indicates a mobile device.
   *
   * @returns `true` if the window width is 768 pixels or less, `false` otherwise.
   */
  private checkIsMobileView(): boolean {
    return window.innerWidth <= 768;
  }
}
