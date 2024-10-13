import { Component, computed, ElementRef, model, OnInit, signal, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { IconName } from '../../icon/icon-name';
import { ImageUploadService } from '../../service/image-upload.service';
import { PictureService } from '../../service/picture.service';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';

@Component({
  selector: 'app-training-banner',
  templateUrl: './training-banner.component.html',
  styleUrls: ['./training-banner.component.scss'],
  standalone: true,
  providers: [PictureService],
  imports: [CircularIconButtonComponent, ImageCropperComponent],
})
export class TrainingBannerComponent implements OnInit {
  protected readonly IconName = IconName;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imageSrc = model('/images/training/training_banner_1.webp');
  isImageSrcBase64 = computed(() => {
    return this.pictureService.isBase64Image(this.imageSrc());
  });

  croppedImage = signal<string | null>(null);

  currentPictureIndex = signal(0);

  constructor(
    private imageUploadService: ImageUploadService,
    private pictureService: PictureService,
  ) {}

  isCropView = signal(false);

  ngOnInit(): void {
    if (!this.imageSrc()) {
      this.imageSrc.set('/images/training/training_banner_1.webp');
    }
  }

  protected async onImageCropped(imageCropperEvent: ImageCroppedEvent) {
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

  protected activateCropView(): void {
    this.isCropView.set(true);
  }

  protected setImageAndDeactivateCropView(): void {
    const croppedImage = this.croppedImage();
    if (croppedImage) {
      this.imageSrc.set(croppedImage);
    }
    this.isCropView.set(false);
  }

  protected triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  protected async handleImageUpload(event: any): Promise<void> {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);
    console.log('🚀 ~ TrainingBannerComponent ~ handleImageUpload ~ uploadedImageBase64Str:', uploadedImageBase64Str);

    if (uploadedImageBase64Str) {
      this.imageSrc.set(uploadedImageBase64Str);
    }
  }

  protected selectNextBannerRecomandation(event: Event): void {
    event.stopPropagation();
    const nextIndex = (this.currentPictureIndex() + 1) % 5;
    this.currentPictureIndex.set(nextIndex);
    this.updateImageSrc();
  }

  protected selectPreviousBannerRecomandation(event: Event): void {
    event.stopPropagation();
    const prevIndex = (this.currentPictureIndex() - 1 + 5) % 5;
    this.currentPictureIndex.set(prevIndex);
    this.updateImageSrc();
  }

  private updateImageSrc() {
    this.imageSrc.set(`/images/training/training_banner_${this.currentPictureIndex() + 1}.webp`);
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
