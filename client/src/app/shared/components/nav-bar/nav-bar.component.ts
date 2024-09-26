import { Component, computed, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
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
  /**
   * Derived signal for the notification count
   */
  protected notificationCount = computed(() => this.notificationService.trainingDayNotifications().length);

  /**
   * Array of navigation items defining the label, route, and associated icon for each navigation button.
   */
  protected navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: this.IconName.HOME },
    { label: 'Training', route: '/exercises', icon: this.IconName.Activity },
    { label: 'Statistiken', route: '/usage', icon: this.IconName.BAR_CHART },
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
          if (currentRoute.includes('statistics')) {
            currentRoute = '/usage';
          } else {
            currentRoute = '/';
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
    this.router.navigate([route]);
  }

  private isRouteRepresentedInNavbar(route: string): boolean {
    return this.navItems.some((item) => item.route === route);
  }
}
