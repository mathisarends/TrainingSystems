import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { BrowserCheckService } from '../browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private browserCheckService: BrowserCheckService,
  ) {}

  /**
   * Determines whether the user can activate the requested route.
   */
  canActivate(): Observable<boolean> {
    if (!this.browserCheckService.isBrowser()) {
      return of(false);
    }

    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    if (this.authService.isAuthenticated() === false) {
      this.authService.showLoginModalDialog();
      return of(false);
    }

    // During app initializaton the authentication status may be undefined because it is fetched from the api, in that case we have to wait for the response
    return this.authService.checkAuthenticationStatus().pipe(
      map(() => {
        const isAuthenticated = this.authService.isAuthenticated();
        if (!isAuthenticated) {
          this.authService.showLoginModalDialog();
        }
        return isAuthenticated as boolean;
      }),
    );
  }
}
