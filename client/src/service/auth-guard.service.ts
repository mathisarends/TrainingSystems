import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ToastService } from '../app/components/toast/toast.service';

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
   * @returns True if the user is authenticated; otherwise, false.
   */
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      this.toastService.show('Fehler', 'Nicht angemeldet');
      return false;
    }
  }
}
