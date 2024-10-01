import { Directive, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ImageUploadService } from '../../service/image-upload.service';
import { OnConfirm } from '../modal/on-confirm';
import { OnToggleView } from '../modal/on-toggle-view';
import { ToastService } from '../toast/toast.service';

/**
 * Signal that holds the state of "no image available".
 */
@Directive()
export abstract class AbstractImageCropperComponent implements OnInit, OnConfirm, OnToggleView {
  @ViewChild('confirmCropIcon') confirmCropIcon!: ElementRef;
  svgStyles: { [key: string]: string } = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
  /**
   * Signal that holds the state of "no image available".
   */
  NO_IMAGE_AVAILABLE = signal<string>('');

  image = signal('');

  initialImage = signal('');

  /**
   * Signal indicating whether the crop view is active.
   */
  isCropView = signal<boolean>(false);

  croppedImage = signal('');

  constructor(
    protected imageUploadService: ImageUploadService,
    protected toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.initialImage.set(this.image());
  }

  /**
   * Submits the image if it has been modified.
   */
  onConfirm() {
    if (this.initialImage() !== this.image()) {
      this.uploadImage(this.image());
    }
  }

  /**
   * Toggles the crop view mode.
   */
  onToggleView() {
    if (this.image() === this.NO_IMAGE_AVAILABLE()) {
      this.toastService.error('Bildzuschnitt nicht möglich');
      return;
    }

    this.isCropView.set(!this.isCropView());
  }

  /**
   * Abstract method for derived components to implement specific behavior
   * for setting the image.
   */
  setImage(value: string): void {
    this.image.set(value);
  }

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
   * Triggered when the image is cropped. Converts the cropped Blob
   * into a Base64 string and updates `imageSignal`.
   */
  protected async imageCropped(event: ImageCroppedEvent) {
    console.log('🚀 ~ AbstractImageCropperComponent ~ imageCropped ~ event:', event);
    if (!event.blob) {
      console.error('Blob is not defined in ImageCroppedEvent');
      return;
    }

    this.svgStyles = {
      top: `${event.imagePosition.y1 + event.imagePosition.y2 / 2}px`,
      left: `${event.imagePosition.x2 + 10}px`,
    };

    try {
      const base64 = await this.convertBlobToBase64(event.blob);
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
  async confirmCrop() {
    if (!this.croppedImage()) {
      console.error('No cropped image available');
      return;
    }

    try {
      this.setImage(this.croppedImage());
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
   * Is called in the onConfirm callback.
   */
  abstract uploadImage(image: string | null): void;
}
