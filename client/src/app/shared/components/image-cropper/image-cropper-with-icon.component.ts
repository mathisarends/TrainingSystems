import { Component, model, signal } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { IconName } from '../../icon/icon-name';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';

@Component({
  selector: 'app-image-cropper-with-icon',
  standalone: true,
  imports: [ImageCropperComponent, CircularIconButtonComponent],
  templateUrl: 'image-cropper-with-icon.component.html',
  styleUrls: ['./image-cropper-with-icon.component.scss'],
})
export class ImageCropperWithIconComponent {
  protected readonly IconName = IconName;

  image = model.required<string>();

  croppedImage = signal('');

  protected async imageCropped(imageCropperEvent: ImageCroppedEvent) {
    if (!imageCropperEvent.blob) {
      console.error('Blob is not defined in ImageCroppedEvent');
      return;
    }

    try {
      const base64 = await this.convertBlobToBase64(imageCropperEvent.blob);
      if (typeof base64 === 'string') {
        this.croppedImage.set(base64);
      }
    } catch (error) {
      console.error('Error converting blob to Base64', error);
    }
  }

  /**
   * Called when the user confirms the crop action. Processes the cropped image.
   */
  confirmCrop() {
    if (!this.croppedImage()) {
      console.error('No cropped image available');
      return;
    }
    console.log('set image');

    this.image.set(this.croppedImage());
  }

  /**
   * Converts a Blob to a Base64 string.
   */
  private convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
