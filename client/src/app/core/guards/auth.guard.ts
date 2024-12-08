import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  /**
   * Determines whether the user can activate the requested route.
   */
  canActivate(): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    if (this.authService.isAuthenticated() === false) {
      this.router.navigate(['getting-started']);
      return of(false);
    }

    // If the authentication status is still undefined (e.g., during app initialization), wait for the API response
    return this.authService.checkAuthenticationStatus().pipe(
      map(() => {
        const isAuthenticated = this.authService.isAuthenticated();
        if (!isAuthenticated) {
          this.router.navigate(['getting-started']);
        }
        return isAuthenticated as boolean;
      }),
    );
  }
}
