import { Injectable, signal, WritableSignal } from '@angular/core';
import { BrowserCheckService } from '../../app/browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  private readonly isMobileSignal!: WritableSignal<boolean>;

  constructor(private browserCheckService: BrowserCheckService) {
    if (this.browserCheckService.isBrowser()) {
      this.isMobileSignal = signal(this.checkIsMobileView());

      window.addEventListener('resize', () => {
        console.log('resize');
        this.isMobileSignal.set(this.checkIsMobileView());
      });
    }
  }

  /**
   * Read-only signal exposing the mobile view state.
   */
  get isMobileView(): boolean {
    return this.isMobileSignal();
  }

  /**
   * Helper function to determine if the view is on a mobile device.
   */
  private checkIsMobileView(): boolean {
    return window.innerWidth <= 768;
  }
}
