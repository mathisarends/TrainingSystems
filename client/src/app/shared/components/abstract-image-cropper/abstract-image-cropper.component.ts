import { Directive, Input, OnInit, signal } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ImageUploadService } from '../../service/image-upload.service';
import { OnConfirm } from '../modal/on-confirm';
import { OnToggleView } from '../modal/on-toggle-view';
import { ToastService } from '../toast/toast.service';

@Directive()
export abstract class AbstractImageCropperComponent implements OnInit, OnConfirm, OnToggleView {
  /**
   * Signal that holds the state of "no image available".
   */
  NO_IMAGE_AVAILABLE = signal<string>('noImageAvailable');

  @Input({ required: true }) image!: string;

  /**
   * Signal holding the state of the current image.
   */
  imageSignal = signal<string | null>(null);

  /**
   * Signal indicating whether the crop view is active.
   */
  isCropView = signal<boolean>(false);

  constructor(
    protected imageUploadService: ImageUploadService,
    protected toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.imageSignal.set(this.image);
  }

  /**
   * Abstract method for derived components to implement specific behavior
   * for setting the image.
   */
  abstract setImage(value: string | null): void;

  /**
   * Uploads the image and sets the uploaded image in `imageSignal`.
   */
  protected async displayUploadedImage(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    this.setImage(uploadedImageBase64Str);
  }

  /**
   * Submits the image if it has been modified.
   */
  onConfirm() {
    if (this.imageSignal() !== this.image) {
      this.uploadImage(this.imageSignal());
    }
  }

  /**
   * Toggles the crop view mode.
   */
  onToggleView() {
    if (this.imageSignal() === this.NO_IMAGE_AVAILABLE()) {
      this.toastService.error('Bildzuschnitt nicht möglich');
      return;
    }

    this.isCropView.set(!this.isCropView());
  }

  /**
   * Triggered when the image is cropped. Converts the cropped Blob
   * into a Base64 string and updates `imageSignal`.
   */
  protected async imageCropped(event: ImageCroppedEvent) {
    if (!event.blob) {
      console.error('Blob is not defined in ImageCroppedEvent');
      return;
    }

    try {
      const base64 = await this.convertBlobToBase64(event.blob);
      if (typeof base64 === 'string') {
        this.setImage(base64);
      }
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

  /**
   * Abstract method to be implemented by derived classes for handling image uploads.
   */
  abstract uploadImage(image: string | null): void;
}
