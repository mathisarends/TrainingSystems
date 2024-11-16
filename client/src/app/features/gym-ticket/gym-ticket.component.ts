import { Component, OnInit } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AbstractImageCropperComponent } from '../../shared/components/abstract-image-cropper/abstract-image-cropper.component';
import { CircularIconButtonComponent } from '../../shared/components/circular-icon-button/circular-icon-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { IconName } from '../../shared/icon/icon-name';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketService } from './gym-ticket.service';
import { GymTicketDto } from './model/gym-ticket-dto';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [ImageCropperComponent, SkeletonComponent, CircularIconButtonComponent],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
  providers: [GymTicketService, ImageDownloadService],
})
export class GymTicketComponent extends AbstractImageCropperComponent implements OnInit {
  protected readonly IconName = IconName;

  constructor(
    private gymTicketService: GymTicketService,
    private imageDownloadService: ImageDownloadService,
    imageUploadService: ImageUploadService,
    toastService: ToastService,
  ) {
    super(imageUploadService, toastService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.NO_IMAGE_AVAILABLE.set('noGymTicketAvailable');

    this.gymTicketService.getGymTicket().subscribe((gymTicket) => {
      this.image.set(gymTicket);
    });
  }

  uploadImage(image: string) {
    const gymTicketDto: GymTicketDto = {
      gymTicket: image,
    };

    this.gymTicketService.uploadGymTicket(gymTicketDto).subscribe((response) => {
      this.toastService.success(response.message);
    });
  }

  downloadImage(event: Event): void {
    event.stopPropagation();
    this.imageDownloadService.downloadImage(this.image(), 'gym-ticket.png');
  }
}
