import { Injectable, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteWatcherService {
  /**
   * A writable signal that holds the current route path.
   */
  private readonly currentRouteSignal: WritableSignal<string> = signal('');

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentRouteSignal.set(event.urlAfterRedirects);
    });
  }

  /**
   * Provides access to the current route signal.
   */
  getCurrentRouteSignal() {
    return this.currentRouteSignal;
  }
}
