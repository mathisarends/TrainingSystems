import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';

/**
 * @service RedirectService
 *
 * The `RedirectService` handles the logic for saving the last visited route
 * and redirecting the user to this route upon app initialization. This service
 * is especially useful for preserving user state across sessions and ensuring
 * that users return to their last location when they revisit the application.
 */
@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  /**
   * Key used to store the last visited route in local storage.
   */
  private readonly LAST_ROUTE_KEY = 'lastRoute';

  constructor(
    private router: Router,
    private destroyRef: DestroyRef,
  ) {}

  initialize(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.saveLastRoute(event.urlAfterRedirects);
      }
    });
  }

  /**
   * Saves the given URL as the last visited route in local storage.
   *
   * @param url - The URL of the route to be saved.
   *
   * Only non-login URLs are stored. The URL `/login` is ignored to prevent redirecting
   * users back to the login page after they have already logged in.
   */
  saveLastRoute(url: string): void {
    if (url === '/?login=success' || url === '/login') return;

    localStorage.setItem(this.LAST_ROUTE_KEY, url);
  }

  /**
   * Retrieves the last visited route from local storage.
   *
   * @returns The last visited route URL as a string, or `null` if no route is stored.
   */
  getLastRoute(): string | null {
    return localStorage.getItem(this.LAST_ROUTE_KEY);
  }

  /**
   * Redirects the user to the last visited route stored in local storage.
   *
   * If the current URL is `/` and there is a stored route that is not `/login`, the service
   * navigates the user to the stored route. This ensures that users are returned to their
   * last location when they reopen the application.
   */
  redirectToLastRoute(): void {
    const lastRoute = this.getLastRoute();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        const currentUrl = this.router.url;

        if (currentUrl === '/' && lastRoute) {
          this.router.navigateByUrl(lastRoute);
        }
      });
  }
}
