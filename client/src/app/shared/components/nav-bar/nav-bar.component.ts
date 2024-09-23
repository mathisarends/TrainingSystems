import { Component, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { RouteWatcherService } from '../../service/route-watcher.service';
import { NavItem } from './nav-item';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  protected IconName = IconName;

  /**
   * Array of navigation items defining the label, route, and associated icon for each navigation button.
   */
  protected navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: this.IconName.HOME },
    { label: 'Statistiken', route: '/usage', icon: this.IconName.BAR_CHART },
    { label: 'Übungen', route: '/exercises', icon: this.IconName.DATABASE },
    { label: 'Profil', route: '/profile', icon: this.IconName.User },
  ];

  /**
   * Signal storing the current active route.
   * This signal is updated when the route changes.
   */
  protected activeRoute: WritableSignal<string> = signal('');

  constructor(
    private router: Router,
    protected routeWatcherService: RouteWatcherService,
    private injector: Injector,
  ) {}

  /**
   * The `effect` function tracks changes in the current route and updates the active route
   * and icon colors reactively.
   */
  ngOnInit(): void {
    effect(
      () => {
        let currentRoute = this.routeWatcherService.getCurrentRouteSignal()();

        const routeExists = this.navItems.some((item) => item.route === currentRoute);

        if (!routeExists) {
          currentRoute = '/';
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
  setActive(route: string): void {
    this.router.navigate([route]);
  }
}
