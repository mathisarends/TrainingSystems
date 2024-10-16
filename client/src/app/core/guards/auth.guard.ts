import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  /**
   * Determines whether the user can activate the requested route.
   */
  canActivate(): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    if (this.authService.isAuthenticated() === false) {
      this.authService.showLoginModalDialog();
      return of(false);
    }

    // If the authentication status is still undefined (e.g., during app initialization), wait for the API response
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
