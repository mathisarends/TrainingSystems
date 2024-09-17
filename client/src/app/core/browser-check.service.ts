import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class BrowserCheckService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  /**
   * Checks if the current platform is a browser.
   * This is useful when using Server-Side Rendering (SSR) or Angular Universal,
   * where some code might only work in the browser.
   *
   * @returns true if the code is running in a browser, otherwise false.
   */
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
