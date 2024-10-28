import { Component, HostListener, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { MoreOptionListItem } from '../more-options-button/more-option-list-item';
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

  options = input<MoreOptionListItem[]>([]);

  isCollapsed = signal(true);

  constructor(private router: Router) {}

  @HostListener('click', ['$event'])
  handleProfileClick(event: Event): void {
    event.preventDefault();

    if (this.options().length > 0) {
      this.isCollapsed.set(!this.isCollapsed());
    } else {
      this.router.navigate(['profile']);
    }
  }
}
