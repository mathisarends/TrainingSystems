import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
  standalone: true,
})
export class ProfilePictureComponent {
  profilePicture = input('');

  onProfilePictureClick = output<void>();

  @HostListener('click', ['$event'])
  handleProfileClick(event: Event): void {
    event.preventDefault();
    this.onProfilePictureClick.emit();
  }
}
