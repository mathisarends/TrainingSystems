import { Component, OnInit } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AbstractImageCropperComponent } from '../../shared/components/abstract-image-cropper/abstract-image-cropper.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketService } from './gym-ticket.service';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [ImageCropperComponent, SkeletonComponent],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
  providers: [GymTicketService],
})
export class GymTicketComponent extends AbstractImageCropperComponent implements OnInit {
  constructor(
    private gymTicketService: GymTicketService,
    imageUploadService: ImageUploadService,
    toastService: ToastService,
  ) {
    super(imageUploadService, toastService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.NO_IMAGE_AVAILABLE.set('noGymTicketAvailable');
  }

  uploadImage(image: string) {
    this.gymTicketService.uploadGymTicket(image).subscribe((response) => {
      this.toastService.success(response.message);
    });
  }
}
