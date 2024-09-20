import { Component, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { RouteWatcherService } from '../../shared/service/route-watcher.service';
import { NavItem } from './nav-item';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss'],
})
export class MobileNavComponent implements OnInit {
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

  /**
   * Signal that holds the colors for each navigation icon, depending on whether the item is active or not.
   */
  protected iconColors: WritableSignal<{ [route: string]: string }> = signal({});

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
        const currentRoute = this.routeWatcherService.getCurrentRouteSignal()();
        this.activeRoute.set(currentRoute);
        this.updateIconColors(currentRoute);
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

  /**
   * Updates the icon colors based on the active route.
   * If the current route matches a navigation item's route, the icon color is set to a highlighted color (`#eee`),
   * otherwise it is set to the default color (`#6c757d`).
   *
   * @param activeRoute The currently active route used to determine the icon color.
   */
  private updateIconColors(activeRoute: string): void {
    const updatedColors: { [route: string]: string } = {};
    this.navItems.forEach((item) => {
      updatedColors[item.route] = activeRoute === item.route ? '#eee' : '#6c757d';
    });
    this.iconColors.set(updatedColors);
  }
}
