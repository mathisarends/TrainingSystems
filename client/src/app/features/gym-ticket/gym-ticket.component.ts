import { Component, Input } from '@angular/core';
import { ModalService } from '../../core/services/modal/modalService';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketService } from './gym-ticket.service';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
  providers: [GymTicketService],
})
export class GymtTicketComponent {
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  @Input({ required: true }) ticketImage!: string;

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
}
