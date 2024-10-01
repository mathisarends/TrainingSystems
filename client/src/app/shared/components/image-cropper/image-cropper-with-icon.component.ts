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

  svgStyles: { [key: string]: string } = {
    top: '50%',
    left: '50%',
  };

  image = model.required<string>();

  croppedImage = signal('');

  constructor() {}

  protected async imageCropped(imageCropperEvent: ImageCroppedEvent) {
    if (!imageCropperEvent.blob) {
      console.error('Blob is not defined in ImageCroppedEvent');
      return;
    }

    this.calculateNewHeightOfIcon(imageCropperEvent);

    try {
      const base64 = await this.convertBlobToBase64(imageCropperEvent.blob);
      if (typeof base64 === 'string') {
        this.croppedImage.set(base64);
      }
    } catch (error) {
      console.error('Error converting blob to Base64', error);
    }
  }

  calculateNewHeightOfIcon(event: ImageCroppedEvent): void {
    const cropContainerTop = event.cropperPosition.y1;
    const cropContainerBottom = event.cropperPosition.y2;
    const cropContainerRight = event.cropperPosition.x2;

    // Calculate vertical middle and right position relative to the cropper
    const iconTopPosition = (cropContainerTop + cropContainerBottom) / 2;
    const iconLeftPosition = cropContainerRight;

    // Apply the styles to move the icon
    this.svgStyles = {
      top: `${iconTopPosition - 10}px`,
      left: `${iconLeftPosition}px`,
    };
  }

  /**
   * Called when the user confirms the crop action. Processes the cropped image.
   */
  async confirmCrop() {
    if (!this.croppedImage()) {
      console.error('No cropped image available');
      return;
    }

    try {
      this.image.set(this.croppedImage());
    } catch (error) {
      console.error('Error converting blob to Base64', error);
    }
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
