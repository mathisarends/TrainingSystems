import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { IconName } from '../../shared/icon/icon-name';
import { IconComponent } from '../../shared/icon/icon.component';
import { ProfileService } from '../profile/profileService';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, IconComponent, HeadlineComponent],
  selector: 'app-mobile-header',
  templateUrl: 'mobile-header.component.html',
  styleUrl: 'mobile-header.component.scss',
})
export class MobileHeaderComponent {
  protected readonly IconName = IconName;

  // Wäre doch eigentlich auch was für einen globalen service
  protected readonly currentUrlSignal = toSignal(
    inject(Router).events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url),
    ),
  );

  constructor(
    protected profileService: ProfileService,
    private location: Location,
  ) {}

  protected navigateToPreviousRoute() {
    this.location.back();
  }
}
