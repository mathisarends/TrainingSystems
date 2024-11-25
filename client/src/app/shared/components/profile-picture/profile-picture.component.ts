import { Component, HostListener, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { MoreOptionsList } from '../more-options-list/more-options-list.component';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
  standalone: true,
  imports: [IconComponent, MoreOptionsList],
})
export class ProfilePictureComponent {
  protected readonly IconName = IconName;

  profilePicture = input('');

  isCollapsed = signal(true);

  constructor(private router: Router) {}

  @HostListener('click', ['$event'])
  handleProfileClick(event: Event): void {
    event.preventDefault();

    this.router.navigate(['profile']);
  }
}
