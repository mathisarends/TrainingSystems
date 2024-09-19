import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, IconComponent, HeadlineComponent, HeaderComponent, SkeletonComponent],
  selector: 'app-mobile-header',
  templateUrl: 'mobile-header.component.html',
  styleUrl: 'mobile-header.component.scss',
})
export class MobileHeaderComponent {
  protected readonly IconName = IconName;

  protected readonly pageTitles = ['Training', 'Profile', 'Stats'];

  protected readonly currentUrlSignal = toSignal(
    inject(Router).events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url.replace(/^\/+/, '') || 'Training'),
    ),
  );

  constructor(
    protected profileService: ProfileService,
    private location: Location,
  ) {}
}
