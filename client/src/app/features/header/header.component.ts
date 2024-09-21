import { Component, effect, Injector, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { HeadlineService } from '../../shared/components/headline/headline.service';
import { MoreOptionsButtonComponent } from '../../shared/components/more-options-button/more-options-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { RouteWatcherService } from '../../shared/service/route-watcher.service';
import { ProfileService } from '../profile-2/service/profileService';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, HeadlineComponent, SkeletonComponent, MoreOptionsButtonComponent],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  protected readonly IconName = IconName;

  protected currentButtonIcon = signal<IconName | null>(null);

  protected moreOptions: string[] = [];

  private routeIconMap = new Map<string, { icon: IconName | null; options: string[] }>([
    ['/', { icon: IconName.PLUS, options: [''] }],
    ['/exercises', { icon: IconName.MORE_VERTICAL, options: ['Zurücksetzen'] }],
    ['/profile', { icon: IconName.MORE_VERTICAL, options: ['Logout'] }],
  ]);

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
        this.updateButtonIconAndOptions(currentRoute);
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  // Emit the button click event
  protected onCircularButtonClick() {
    this.buttonClickService.emitButtonClick();
  }

  protected onOptionSelected(option: string) {
    this.buttonClickService.emitButtonClick(option);
  }

  private updateButtonIconAndOptions(routePath: string) {
    const queryParams = this.route.snapshot.queryParams;

    if (this.isTrainingViewRoute(queryParams)) {
      this.currentButtonIcon.set(IconName.CLOCK);
    } else if (this.routeIconMap.has(routePath)) {
      const { icon, options } = this.routeIconMap.get(routePath)!;
      this.currentButtonIcon.set(icon);
      this.moreOptions = options;
    } else {
      this.currentButtonIcon.set(null);
      this.moreOptions = [];
    }
  }

  private isTrainingViewRoute(queryParams: Params) {
    return queryParams['planId'] && queryParams['week'] && queryParams['day'];
  }
}
