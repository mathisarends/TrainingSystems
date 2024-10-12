import { Component, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
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
export class NavBarComponent implements OnInit {
  protected IconName = IconName;

  // Routen ideen heir allowed routes ergänzen

  /**
   * Array of navigation items defining the label, route, and associated icon for each navigation button.
   */
  protected navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: this.IconName.HOME },
    { label: 'Training', route: '', icon: this.IconName.Activity },
    { label: 'Logs', route: '/logs', icon: this.IconName.BookOpen },
    { label: 'Profil', route: '/profile', icon: this.IconName.User },
  ];

  /**
   * Signal storing the current active route.
   * This signal is updated when the route changes.
   */
  protected activeRoute: WritableSignal<string> = signal('');

  constructor(
    protected routeWatcherService: RouteWatcherService,
    protected notificationService: NotificationService,
    private httpService: HttpService,
    private router: Router,
    private injector: Injector,
  ) {}

  /**
   * The `effect` function tracks changes in the current route and updates the active route
   */
  ngOnInit(): void {
    effect(
      () => {
        let currentRoute = this.routeWatcherService.getCurrentRouteSignal()();

        if (!this.isRouteRepresentedInNavbar(currentRoute)) {
          if (this.isLoginSucessRoute(currentRoute)) {
            currentRoute = '/';
          }

          if (this.isTrainingPlanUuidInRoute(currentRoute)) {
            currentRoute = '';
          } else {
            currentRoute = '/profile';
          }
        }
        this.activeRoute.set(currentRoute);
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Updates the current route by navigating to the specified route.
   *
   * @param route The route to navigate to.
   */
  protected setActive(route: string): void {
    if (this.isActivityRoute(route)) {
      this.redirectToMostRecentTrainingDay();
      return;
    }

    this.router.navigate([route]);
  }

  private isRouteRepresentedInNavbar(route: string): boolean {
    return this.navItems.some((item) => item.route === route);
  }

  private redirectToMostRecentTrainingDay() {
    this.httpService.get<string>('/training/most-recent-plan-link').subscribe((link) => {
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

  private isTrainingPlanUuidInRoute(route: string): boolean {
    const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

    return uuidRegex.test(route);
  }

  private isActivityRoute(route: string) {
    return !route;
  }

  private isLoginSucessRoute(url: string): boolean {
    return url.includes('?login=success');
  }
}
