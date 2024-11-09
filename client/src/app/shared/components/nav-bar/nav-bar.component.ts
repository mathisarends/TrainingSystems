import { Component, effect, Renderer2, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { NotificationService } from '../../service/notification.service';
import { RouteWatcherService } from '../../service/route-watcher.service';
import { NotificationBadgeComponent } from '../notification-badge/notification-badge.component';
import { NavItem } from './nav-item';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [IconComponent, NotificationBadgeComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
  protected IconName = IconName;

  // Routen ideen heir allowed routes ergänzen

  /**
   * Array of navigation items defining the label, route, and associated icon for each navigation button.
   */
  protected navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: this.IconName.HOME },
    { label: 'Training', route: '', icon: this.IconName.Activity },
    { label: 'Logs', route: '/logs', icon: this.IconName.CALENDAR },
    { label: 'Profil', route: '/profile', icon: this.IconName.User },
  ];

  /**
   * Signal storing the current active route.
   */
  protected activeRoute: WritableSignal<string> = signal('');

  private clickedElement: HTMLElement | null = null;

  constructor(
    protected routeWatcherService: RouteWatcherService,
    protected notificationService: NotificationService,
    private renderer: Renderer2,
    private httpService: HttpService,
    private router: Router,
  ) {
    effect(
      () => {
        let currentRoute = this.routeWatcherService.getCurrentRouteSignal()();

        if (!this.isRouteRepresentedInNavbar(currentRoute)) {
          if (this.isLoginSucessRoute(currentRoute)) {
            currentRoute = '/';
          }

          if (this.isMongooseObjectIdInRoute()) {
            currentRoute = '';
          } else {
            currentRoute = '/profile';
          }
        }
        this.activeRoute.set(currentRoute);
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Updates the current route by navigating to the specified route.
   *
   * @param route The route to navigate to.
   */
  protected setActive(route: string, event: Event): void {
    this.clickedElement = event.currentTarget as HTMLElement;

    if (this.isActivityRoute(route)) {
      this.redirectToMostRecentTrainingDay(event);
      return;
    }

    this.router.navigate([route]);
  }

  private isRouteRepresentedInNavbar(route: string): boolean {
    return this.navItems.some((item) => item.route === route);
  }

  private redirectToMostRecentTrainingDay(event: Event) {
    this.httpService
      .get<string>('/training/most-recent-plan-link')
      .pipe(
        catchError((error) => {
          if (error.status === 404 && this.clickedElement) {
            console.log('🚀 ~ NavBarComponent ~ catchError ~ this.clickedElement:', this.clickedElement);
            // Entferne die `active`-Klasse vom gespeicherten Element
            this.clickedElement.blur(); // Entfernt den Fokus von dem Element
            this.renderer.addClass(this.clickedElement, 'inactive');
            this.router.navigateByUrl('/');
          }
          return EMPTY;
        }),
      )
      .subscribe((link) => {
        const url = new URL(link);
        const path = url.pathname;

        const queryParams = {
          planId: url.searchParams.get('planId'),
          week: url.searchParams.get('week'),
          day: url.searchParams.get('day'),
        };

        this.router.navigate([path], { queryParams });
      });
  }

  /**
   * Checks if the route contains a Mongoose ObjectId (24-character hex string).
   */
  private isMongooseObjectIdInRoute(): boolean {
    const url = new URL(window.location.href);
    const planId = url.searchParams.get('planId');

    if (!planId) {
      return false;
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(planId);
  }

  private isActivityRoute(route: string) {
    return !route;
  }

  private isLoginSucessRoute(url: string): boolean {
    return url.includes('?login=success');
  }
}
