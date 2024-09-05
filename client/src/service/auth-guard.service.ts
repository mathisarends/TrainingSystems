import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ToastService } from '../app/components/toast/toast.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  /**
   * Determines if a route can be activated.
   * Uses the AuthService to check if the user is authenticated.
   * If not authenticated, redirects to the login page.
   * @returns An Observable that emits true if the user is authenticated; otherwise, false.
   */
  canActivate(): Observable<boolean> {
    // Call the checkAuthenticationStatus method and subscribe to the observable

    if (this.authService.isAuthenticated() === undefined) {
      return this.authService.checkAuthenticationStatus().pipe(
        map(() => {
          if (this.authService.isAuthenticated()) {
            return true;
          } else {
            this.router.navigate(['/login']);
            this.toastService.show('Fehler', 'Nicht angemeldet');
            return false;
          }
        }),
        catchError(() => {
          this.router.navigate(['/login']);
          this.toastService.show('Fehler', 'Nicht angemeldet');
          return of(false);
        }),
      );
    }

    if (!this.authService.isAuthenticated()) {
      return of(false);
    }

    return of(true);
  }
}
