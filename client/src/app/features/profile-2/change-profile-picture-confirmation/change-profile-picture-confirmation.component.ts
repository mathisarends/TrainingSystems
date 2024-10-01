import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AbstractImageCropperComponent } from '../../../shared/components/abstract-image-cropper/abstract-image-cropper.component';
import { ImageCropperWithIconComponent } from '../../../shared/components/image-cropper/image-cropper-with-icon.component';
import { OnToggleView } from '../../../shared/components/modal/on-toggle-view';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ProfileService } from '../service/profileService';
import { UpdateProfilePictureDto } from '../service/update-profile-picture-dto';

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
export class ChangeProfilePictureConfirmationComponent implements OnToggleView {
  protected readonly IconName = IconName;

  oldProfilePicture = signal('');

  image = signal('');

  isCropView = signal(false);

  confirmCropSignal = signal(false);

  constructor(
    private readonly profileService: ProfileService,
    private readonly toastService: ToastService,
  ) {}

  uploadImage(image: string): void {}

  /**
   * Toggles the crop view mode.
   */
  onToggleView(): void {
    this.isCropView.set(!this.isCropView());
    this.confirmCropSignal.set(false);
  }

  onConfirm(): void {
    if (this.isCropView()) {
      this.confirmCropSignal.set(true);
      this.isCropView.set(false);
    } else {
      const updateProfilePictureDto: UpdateProfilePictureDto = {
        profilePicture: this.image(),
      };

      this.profileService.uploadProfilePicture(updateProfilePictureDto).subscribe((response) => {
        this.toastService.success(response.message);
        this.profileService.pictureUrl.set(this.image());

        this.profileService.fetchAndSetProfileData();
      });
    }
  }
}
