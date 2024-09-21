import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ModalService } from '../../core/services/modal/modalService';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketService } from './gym-ticket.service';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
  providers: [GymTicketService],
})
export class GymTicketComponent {
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  @Input({ required: true }) ticketImage!: string;

  isCropping = false;
  croppedImage: string | null | undefined = null;

  constructor(
    private imageUploadService: ImageUploadService,
    private gymTicketService: GymTicketService,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {}

  protected async handleImageUpload(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    this.gymTicketService.uploadGymTicket(uploadedImageBase64Str).subscribe(() => {
      this.modalService.close();
      this.toastService.success('Ticket hochgeladen');
    });
  }

  // Aktiviert den Image-Cropper
  protected startCropping() {
    this.isCropping = true;
  }

  // Wird ausgelöst, wenn das Bild zugeschnitten wurde
  protected imageCropped(event: ImageCroppedEvent) {
    if (!event.blob) {
      console.error('Blob is not defined in ImageCroppedEvent');
    }
    this.convertBlobToBase64(event.blob!)
      .then((base64: string | ArrayBuffer | null) => {
        if (typeof base64 === 'string') {
          console.log('Converted Base64 string:', base64);
          this.croppedImage = base64;
        }
      })
      .catch((error) => {
        console.error('Error converting blob to Base64', error);
      });
  }

  protected uploadCroppedImage() {
    if (this.croppedImage) {
      this.gymTicketService.uploadGymTicket(this.croppedImage).subscribe(() => {
        this.modalService.close();
        this.toastService.success('Zugeschnittenes Ticket hochgeladen');
        this.isCropping = false;
      });
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Blob wird als Base64 gelesen
    });
  }
}
