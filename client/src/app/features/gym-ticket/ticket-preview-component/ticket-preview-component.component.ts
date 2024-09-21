import { Component, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../shared/service/image-upload.service';
import { GymTicketService } from '../gym-ticket.service';

@Component({
  selector: 'app-ticket-preview-component',
  standalone: true,
  imports: [],
  templateUrl: './ticket-preview-component.component.html',
  styleUrls: ['./ticket-preview-component.component.scss'],
  providers: [GymTicketService],
})
export class TicketPreviewComponentComponent {
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  @Input({ required: true }) ticketImage!: string;

  constructor(
    private imageUploadService: ImageUploadService,
    private gymTicketService: GymTicketService,
    private toastService: ToastService,
  ) {}

  protected async handleImageUpload(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    this.gymTicketService.uploadGymTicket(uploadedImageBase64Str).subscribe(async () => {
      this.toastService.success('Ticket hochgeladen');
      this.ticketImage = await firstValueFrom(this.gymTicketService.getGymTicket());
    });
  }
}
