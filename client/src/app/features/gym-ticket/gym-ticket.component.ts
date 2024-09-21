import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
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
export class GymTicketComponent implements OnInit {
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  @Input({ required: true }) ticketImage!: string;

  ticketImageSignal = signal<string>('');
  isCropView = signal<boolean>(false);

  constructor(
    private imageUploadService: ImageUploadService,
    private gymTicketService: GymTicketService,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.ticketImageSignal.set(this.ticketImage);
  }

  protected async displayUploadedImage(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    this.ticketImageSignal.set(uploadedImageBase64Str);
  }

  protected async imageCropped(event: ImageCroppedEvent) {
    if (!event.blob) {
      console.error('Blob is not defined in ImageCroppedEvent');
    }

    try {
      const base64 = await this.convertBlobToBase64(event.blob!);

      if (typeof base64 === 'string') {
        this.ticketImageSignal.set(base64);
      }
    } catch (error) {
      console.error('Error converting blob to Base64', error);
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

  onSubmit() {
    if (this.ticketImageSignal() !== this.ticketImage) {
      this.gymTicketService.uploadGymTicket(this.ticketImageSignal()).subscribe((response) => {
        this.toastService.success(response.message);
      });
    }
  }

  onSecondaryButtonClick() {
    this.isCropView.set(!this.isCropView());
  }
}
