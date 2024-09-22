import { Component, Input } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AbstractImageCropperComponent } from '../../../shared/components/abstract-image-cropper/abstract-image-cropper.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ImageUploadService } from '../../../shared/service/image-upload.service';
import { ProfileService } from '../service/profileService';

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
  imports: [IconComponent, ImageCropperComponent],
  templateUrl: './change-profile-picture-confirmation.component.html',
  styleUrl: './change-profile-picture-confirmation.component.scss',
})
export class ChangeProfilePictureConfirmationComponent extends AbstractImageCropperComponent {
  protected readonly IconName = IconName;

  @Input() oldProfilePicture: string = '';

  constructor(
    private profileService: ProfileService,
    imageUploadService: ImageUploadService,
    toastService: ToastService,
  ) {
    super(imageUploadService, toastService);
  }

  override uploadImage(image: string): void {
    this.profileService.uploadProfilePicture(image).subscribe((response) => {
      this.toastService.success(response.message);
      this.profileService.fetchAndSetProfileData();
    });
  }
}
