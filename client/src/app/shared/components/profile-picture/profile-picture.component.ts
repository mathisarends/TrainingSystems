import { Component, HostListener, output } from '@angular/core';
import { ProfileService } from '../../../features/profile-2/service/profileService';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
  standalone: true,
})
export class ProfilePictureComponent {
  onProfilePictureClick = output<void>();

  constructor(protected profileService: ProfileService) {}

  @HostListener('click', ['$event'])
  handleProfileClick(event: Event): void {
    event.preventDefault();
    this.onProfilePictureClick.emit();
  }
}
