import { Injectable } from '@angular/core';
import { BrowserCheckService } from '../../app/browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  constructor(private browserCheckService: BrowserCheckService) {}

  /**
   * Checks if the current view is on a mobile device.
   * @returns true if the view is mobile, false otherwise.
   */
  isMobileView(): boolean {
    if (this.browserCheckService.isBrowser()) {
      return window.innerWidth <= 768;
    }
    return false;
  }
}
