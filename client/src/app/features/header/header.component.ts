import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { MoreOptionsButtonComponent } from '../../shared/components/more-options-button/more-options-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { ProfileService } from '../profile-2/service/profileService';
import { HeaderService } from './header.service';
import { HeadlineButton } from './headline-button';

@Component({
  standalone: true,
  imports: [CircularIconButtonComponent, HeadlineComponent, SkeletonComponent, MoreOptionsButtonComponent],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly IconName = IconName;

  constructor(
    protected profileService: ProfileService,
    protected headerService: HeaderService,
    private router: Router,
  ) {}

  // Emit the button click event
  protected onCircularButtonClick(button: HeadlineButton) {
    if (button.callback) {
      button.callback();
    } else {
      console.warn('No callback for button registered');
    }
  }

  protected onProfilePictureClick() {
    this.router.navigate(['profile']);
  }
}
