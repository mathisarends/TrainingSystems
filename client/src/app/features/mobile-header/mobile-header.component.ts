import { Component, effect, Injector, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingService } from '../../core/loading.service';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { HeadlineService } from '../../shared/components/headline/headline.service';
import { MoreOptionsButtonComponent } from '../../shared/components/more-options-button/more-options-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { RouteWatcherService } from '../../shared/service/route-watcher.service';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, HeadlineComponent, SkeletonComponent, MoreOptionsButtonComponent],
  selector: 'app-mobile-header',
  templateUrl: 'mobile-header.component.html',
  styleUrl: 'mobile-header.component.scss',
})
export class MobileHeaderComponent implements OnInit {
  protected readonly IconName = IconName;

  protected currentButtonIcon = signal<IconName | null>(null);

  constructor(
    protected profileService: ProfileService,
    protected headlineService: HeadlineService,
    protected loadingService: LoadingService,
    private buttonClickService: ButtonClickService,
    private route: ActivatedRoute,
    private routeWatcherService: RouteWatcherService,
    private injector: Injector,
  ) {
    // Use the effect to automatically update the button icon based on the route signal
  }

  ngOnInit(): void {
    effect(
      () => {
        const currentRoute = this.routeWatcherService.getCurrentRouteSignal()();
        this.updateButtonIcon(currentRoute);
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  // Emit the button click event
  protected onCircularButtonClick() {
    this.buttonClickService.emitButtonClick();
  }

  private updateButtonIcon(routePath: string) {
    console.log('🚀 ~ MobileHeaderComponent ~ updateButtonIcon ~ routePath:', routePath);
    const queryParams = this.route.snapshot.queryParams;

    if (this.isTrainingViewRoute(queryParams)) {
      this.currentButtonIcon.set(IconName.CLOCK);
    } else if (routePath === '/') {
      this.currentButtonIcon.set(IconName.PLUS);
    } else if (routePath === '/exercises') {
      this.currentButtonIcon.set(IconName.MORE_VERTICAL);
    } else {
      this.currentButtonIcon.set(null);
    }
  }

  private isTrainingViewRoute(queryParams: Params) {
    return queryParams['planId'] && queryParams['week'] && queryParams['day'];
  }
}
