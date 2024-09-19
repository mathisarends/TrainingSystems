import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LoadingService } from '../../core/loading.service';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { HeadlineService } from '../../shared/components/headline/headline.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { ButtonClickService } from '../../shared/service/button-click.service';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, HeadlineComponent, SkeletonComponent],
  selector: 'app-mobile-header',
  templateUrl: 'mobile-header.component.html',
  styleUrl: 'mobile-header.component.scss',
})
export class MobileHeaderComponent {
  protected readonly IconName = IconName;

  protected currentButtonIcon = signal<IconName | null>(null);

  constructor(
    protected profileService: ProfileService,
    protected headlineService: HeadlineService,
    protected loadingService: LoadingService,
    private buttonClickService: ButtonClickService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.checkRouteForButtonIcon();
      });
  }

  // Emit the button click event
  protected onCircularButtonClick() {
    this.buttonClickService.emitButtonClick();
  }

  // Method to determine which button icon to display based on the route
  private checkRouteForButtonIcon() {
    const queryParams = this.route.snapshot.queryParams;
    const routePath = this.router.url;

    const hasPlanId = queryParams['planId'];
    const hasWeek = queryParams['week'];
    const hasDay = queryParams['day'];

    if (hasPlanId && hasWeek && hasDay) {
      // Show the clock icon if all query params are present
      this.currentButtonIcon.set(IconName.CLOCK);
    } else if (routePath === '/') {
      // Show the plus icon if the route is "/"
      this.currentButtonIcon.set(IconName.PLUS);
    } else {
      // Set to null to show the profile picture in other cases
      this.currentButtonIcon.set(null);
    }
  }
}
