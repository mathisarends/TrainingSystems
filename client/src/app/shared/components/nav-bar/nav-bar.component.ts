import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  Injector,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../../core/services/loading.service';
import { SwipeService } from '../../../core/services/swipe.service';
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
export class NavBarComponent implements OnInit, AfterViewInit {
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
    protected notificationService: NotificationService,
    private swipeService: SwipeService,
    private loadingService: LoadingService,
    private elementRef: ElementRef,
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
   * After the view is fully initialized, swipe listeners are set up based on the active route.
   * This ensures that the DOM is completely rendered before manipulating DOM elements.
   */
  ngAfterViewInit(): void {
    effect(
      () => {
        const currentRoute = this.routeWatcherService.getCurrentRouteSignal()();

        this.swipeService.removeSwipeListener();
        if (!this.loadingService.isLoading() && this.isRouteRepresentedInNavbar(currentRoute)) {
          this.setupSwipeListeners(currentRoute);
        }
      },
      { injector: this.injector },
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

  /**
   * Sets up swipe listeners for the specified route. This adds swipe navigation
   * based on the active route and ignores certain elements depending on the route.
   */
  private setupSwipeListeners(route: string) {
    const navbar = this.elementRef.nativeElement;
    const appRoot = navbar.parentElement;

    const outletWrapper = appRoot.querySelector('.outlet-wrapper');
    this.handleForbiddenSwipeElementsForRoute(route, outletWrapper);

    this.swipeService.addSwipeListener(
      outletWrapper,
      () => this.handleSwipeNavigation('left'),
      () => this.handleSwipeNavigation('right'),
      () => {},
      () => {},
    );
  }

  /**
   * After the view is fully initialized, swipe listeners are set up based on the active route.
   * This ensures that the DOM is completely rendered before manipulating DOM elements.
   */
  private handleForbiddenSwipeElementsForRoute(route: string, outletWrapper: HTMLElement) {
    if (route === '/usage') {
      const excludedElementsNodeList = outletWrapper.querySelectorAll('app-activity-calendar');
      const excludedElementsArray = Array.from(excludedElementsNodeList) as HTMLElement[];

      this.swipeService.setExcludedElements(excludedElementsArray);
    }
  }

  /**
   * Handles the navigation based on swipe direction and current route.
   * Uses the `navItems` array to determine the previous or next route.
   * @param direction - The swipe direction ('left' or 'right').
   */
  private handleSwipeNavigation(direction: 'left' | 'right') {
    const currentIndex = this.navItems.findIndex((item) => item.route === this.activeRoute());

    if (direction === 'left' && currentIndex < this.navItems.length - 1) {
      const nextRoute = this.navItems[currentIndex + 1].route;
      this.setActive(nextRoute);
    } else if (direction === 'right' && currentIndex > 0) {
      const previousRoute = this.navItems[currentIndex - 1].route;
      this.setActive(previousRoute);
    }
  }

  private isRouteRepresentedInNavbar(route: string): boolean {
    return this.navItems.some((item) => item.route === route);
  }
}
