import { CommonModule } from '@angular/common';
import { Component, effect, Inject, signal } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ImageCropperWithIconComponent } from '../../../shared/components/image-cropper/image-cropper-with-icon.component';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { PROFILE_PICTURE_URL } from './profile-picture-injection-token';

/**
 * HHandles the functionality for
 * changing and confirming the profile picture. It integrates with the `ProfileService` to upload
 * the new profile picture and refresh the profile data.
 *
 * @extends AbstractImageCropperComponent
 */
@Component({
  selector: 'app-change-profile-picture-confirmation',
  standalone: true,
  imports: [IconComponent, ImageCropperComponent, CommonModule, ImageCropperWithIconComponent],
  templateUrl: './change-profile-picture-confirmation.component.html',
  styleUrl: './change-profile-picture-confirmation.component.scss',
})
export class ChangeProfilePictureConfirmationComponent {
  protected readonly IconName = IconName;

  oldProfilePicture = signal('');

  image = signal('');

  isCropView = signal(false);

  confirmCropSignal = signal(false);

  constructor(@Inject(PROFILE_PICTURE_URL) private profilePictureUrl: string) {
    this.image.set(profilePictureUrl);

    effect(
      () => {
        if (this.image()) {
          this.isCropView.set(false);
        }
      },
      { allowSignalWrites: true },
    );
  }
}
