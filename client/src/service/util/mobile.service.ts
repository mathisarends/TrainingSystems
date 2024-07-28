import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Checks if the current view is on a mobile device.
   * @returns true if the view is mobile, false otherwise.
   */
  isMobileView(): boolean {
    if (this.isBrowser) {
      return window.innerWidth <= 768; // Adjust the width threshold as needed
    }
    return false; // Default to false if not running in the browser
  }
}
