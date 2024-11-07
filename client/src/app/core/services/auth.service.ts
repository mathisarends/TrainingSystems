import { Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpService } from './http-client.service';
import { ModalService } from './modal/modalService';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly isAuthenticatedSignal: WritableSignal<boolean | undefined> = signal(undefined);

  constructor(
    private httpService: HttpService,
    private modalService: ModalService,
    private router: Router,
  ) {}

  /**
   * Checks the initial authentication status of the user by making a request to the backend.
   * @returns An Observable that completes when the authentication status check is done.
   */
  checkAuthenticationStatus(): Observable<boolean> {
    return this.httpService.get('/auth-state').pipe(
      map(() => {
        this.isAuthenticatedSignal.set(true);
        return true;
      }),
      catchError(() => {
        this.isAuthenticatedSignal.set(false);
        return of(false);
      }),
    );
  }

  /**
   * Logs out the user
   */
  logout(): void {
    this.httpService.post('/auth/logout').subscribe(() => {
      this.isAuthenticatedSignal.set(false);
      this.router.navigate(['getting-started']);
    });
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns A boolean value indicating the current authentication status.
   */
  isAuthenticated(): boolean | undefined {
    return this.isAuthenticatedSignal();
  }

  setAuthenticated(authenticated: boolean): void {
    this.isAuthenticatedSignal.set(authenticated);
  }

  /**
   * Sets the authentication status of the user.
   * @param authStatus - A boolean indicating the authentication status to set.
   */
  setAuthenticationStatus(authStatus: boolean) {
    this.isAuthenticatedSignal.set(authStatus);
  }

  /**
   * Checks for the presence of a temporary authentication cookie.
   * The cookie is sent to validate the redirection from google-oauth-2
   * @returns A boolean indicating if the 'authTemp' cookie is present.
   */
  checkTempAuthCookie(): boolean {
    return !!this.getCookie('authTemp');
  }

  /**
   * Utility function to get a cookie value by name.
   * @param name - The name of the cookie to retrieve.
   * @returns The value of the cookie, or null if not found.
   */
  private getCookie(name: string): string | null {
    const regex = new RegExp('(^| )' + name + '=([^;]+)');
    const match = regex.exec(document.cookie);
    return match ? match[2] : null;
  }
}
