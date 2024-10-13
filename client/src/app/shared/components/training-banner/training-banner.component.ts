import { Component, computed, ElementRef, model, OnInit, signal, ViewChild } from '@angular/core';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { ImageUploadService } from '../../service/image-upload.service';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';

@Component({
  selector: 'app-training-banner',
  templateUrl: './training-banner.component.html',
  styleUrls: ['./training-banner.component.scss'],
  standalone: true,
  imports: [IconComponent, CircularIconButtonComponent],
})
export class TrainingBannerComponent implements OnInit {
  protected readonly IconName = IconName;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imageSrc = model('/images/training/training_banner_1.webp');

  currentPictureIndex = signal(0);

  constructor(private imageUploadService: ImageUploadService) {}

  activeViewIndex = signal(0);

  isCropView = computed(() => {
    console.log('this.activeVewIndex()', !!this.activeViewIndex());
    return !!this.activeViewIndex();
  });

  ngOnInit(): void {
    if (!this.imageSrc()) {
      this.imageSrc.set('/images/training/training_banner_1.webp');
    }
  }

  protected triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  protected async handleImageUpload(event: any): Promise<void> {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

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
}
