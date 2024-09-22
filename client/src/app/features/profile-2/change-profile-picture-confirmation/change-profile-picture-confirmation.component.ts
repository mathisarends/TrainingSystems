import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';
import { IconName } from '../../../shared/icon/icon-name';

@Component({
  selector: 'app-change-profile-picture-confirmation',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './change-profile-picture-confirmation.component.html',
  styleUrl: './change-profile-picture-confirmation.component.scss',
})
export class ChangeProfilePictureConfirmationComponent {
  protected readonly IconName = IconName;

  @Input() oldProfilePicture: string = '';
  @Input() newProfilePicture: string = '';
}