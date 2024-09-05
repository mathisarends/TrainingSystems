import { Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpService } from './http/http-client.service';
import { ActivatedRoute } from '@angular/router';
import { BrowserCheckService } from '../app/browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly isAuthenticatedSignal: WritableSignal<boolean | undefined> = signal(undefined);

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private browserCheckService: BrowserCheckService,
  ) {
    const isBrowserEnv = this.browserCheckService.isBrowser(); // Prevent warning that service is not used

    if (isBrowserEnv) {
      this.activatedRoute.queryParams.subscribe((params) => {
        if (params['login'] === 'success' && this.checkTempAuthCookie()) {
          this.setAuthenticationStatus(true);
        }
      });
    }
  }

  /**
   * Checks the initial authentication status of the user by making a request to the backend.
   * @returns An Observable that completes when the authentication status check is done.
   */
  checkAuthenticationStatus(): Observable<void> {
    return this.httpService.get('/user/auth-state').pipe(
      map(() => {
        console.log('Authentication check completed - user is authenticated');
        this.isAuthenticatedSignal.set(true);
      }),
      catchError((error) => {
        console.error('Error during authentication check:', error);
        this.isAuthenticatedSignal.set(false);
        return of();
      }),
    );
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns A boolean value indicating the current authentication status.
   */
  isAuthenticated(): boolean | undefined {
    return this.isAuthenticatedSignal();
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
  private checkTempAuthCookie(): boolean {
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
