import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { OnConfirm } from '../../shared/components/modal/on-confirm';
import { OnToggleView } from '../../shared/components/modal/on-toggle-view';
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
export class GymTicketComponent implements OnInit, OnConfirm, OnToggleView {
  /**
   * Constant that is send from server when no gym ticket was set.
   */
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  @Input({ required: true }) ticketImage!: string;

  /**
   *  Holds the state of the current gym ticket image.
   */
  ticketImageSignal = signal<string>('');

  /**
   * Signal indicating whether the crop view (for image cropping) is active.
   * When true, the image crop view is displayed; otherwise, the normal image is shown.
   */
  isCropView = signal<boolean>(false);

  constructor(
    private imageUploadService: ImageUploadService,
    private gymTicketService: GymTicketService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.ticketImageSignal.set(this.ticketImage);
  }

  /**
   * Handles the image upload, converts it to a Base64 string,
   * and sets the uploaded image in the `ticketImageSignal`.
   */
  protected async displayUploadedImage(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    this.ticketImageSignal.set(uploadedImageBase64Str);
  }

  /**
   * Triggered when the image is cropped. Converts the cropped Blob
   * into a Base64 string and updates the `ticketImageSignal`.
   */
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
   * Submits the form data, checks if the ticket image has been modified,
   * and uploads the updated image if necessary.
   */
  onConfirm() {
    if (this.ticketImageSignal() !== this.ticketImage) {
      this.gymTicketService.uploadGymTicket(this.ticketImageSignal()).subscribe((response) => {
        this.toastService.success(response.message);
      });
    }
  }

  /**
   * Toggles the crop view mode. Switches between cropping the image
   * and viewing the uploaded image.
   */
  onToggleView() {
    this.isCropView.set(!this.isCropView());
  }
}
