import { Component, input } from '@angular/core';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

@Component({
  selector: 'app-profile-picture-with-info',
  templateUrl: './profile-picture-with-info.component.html',
  styleUrls: ['./profile-picture-with-info.component.scss'],
  standalone: true,
  imports: [ProfilePictureComponent],
})
export class ProfilePictureWithInfoComponent {
  profilePicture = input('');
  username = input('');
  email = input('');
}
