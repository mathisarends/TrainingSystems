import { AfterViewInit, Component, effect, ElementRef, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../../core/services/loading.service';
import { SwipeService } from '../../../core/services/swipe.service';
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
export class NavBarComponent implements OnInit, AfterViewInit {
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

        const routeExists = this.navItems.some((item) => item.route === currentRoute);
        this.swipeService.removeSwipeListener();

        if (!routeExists) {
          currentRoute = '/';
        } else {
          this.activeRoute.set(currentRoute);
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  ngAfterViewInit(): void {
    effect(
      () => {
        const currentRoute = this.activeRoute();

        if (!this.loadingService.isLoading()) {
          this.setupSwipeListeners(currentRoute);
        }
      },
      { injector: this.injector },
    );
  }

  setupSwipeListeners(route: string) {
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

  handleForbiddenSwipeElementsForRoute(route: string, outletWrapper: HTMLElement) {
    if (route === '/usage') {
      const excludedElementsNodeList = outletWrapper.querySelectorAll('app-activity-calendar');
      const excludedElementsArray = Array.from(excludedElementsNodeList) as HTMLElement[];

      this.swipeService.setExcludedElements(excludedElementsArray);
    } else {
      this.swipeService.setExcludedElements([]);
    }
  }

  /**
   * Handles the navigation based on swipe direction and current route.
   * Uses the `navItems` array to determine the previous or next route.
   * @param direction - The swipe direction ('left' or 'right').
   */
  handleSwipeNavigation(direction: 'left' | 'right') {
    const currentIndex = this.navItems.findIndex((item) => item.route === this.activeRoute());

    if (direction === 'left' && currentIndex < this.navItems.length - 1) {
      const nextRoute = this.navItems[currentIndex + 1].route;
      this.setActive(nextRoute);
    } else if (direction === 'right' && currentIndex > 0) {
      const previousRoute = this.navItems[currentIndex - 1].route;
      this.setActive(previousRoute);
    }
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
