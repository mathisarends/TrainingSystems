import { AsyncPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketService } from './gym-ticket.service';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [ImageCropperComponent, SkeletonComponent, CircularIconButtonComponent, AsyncPipe],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
  providers: [ImageDownloadService],
})
export class GymTicketComponent implements OnInit {
  protected readonly IconName = IconName;

  loading = signal(true);

  constructor(
    protected gymTicketService: GymTicketService,
    private imageDownloadService: ImageDownloadService,
    private imageUploadService: ImageUploadService,
  ) {}

  ngOnInit(): void {
    this.gymTicketService.getGymTicket().subscribe(() => this.loading.set(false));
  }

  /**
   * Uploads the image and sets the uploaded image in `imageSignal`.
   */
  protected async displayUploadedImage(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    this.gymTicketService.gymTicket.set(uploadedImageBase64Str);
  }

  downloadImage(event: Event): void {
    event.stopPropagation();
    this.imageDownloadService.downloadImage(this.gymTicketService.gymTicket(), 'gym-ticket.png');
  }
}
