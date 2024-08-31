import { Component } from '@angular/core';
import { ImageUploadService } from '../../service/util/image-upload.service';
import { ModalService } from '../../service/modal/modalService';
import { TicketPreviewComponentComponent } from '../ticket-preview-component/ticket-preview-component.component';
import { GymTicketService } from './gym-ticket.service';
import { ToastService } from '../components/toast/toast.service';
import { ToastStatus } from '../components/toast/toast-status';

@Component({
  selector: 'app-gym-ticket',
  standalone: true,
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
})
export class GymTicketComponent {
  uploadedImage: string | null = null;

  constructor(
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private toastService: ToastService,
    private gymTicketService: GymTicketService,
  ) {}

  protected handleImageUpload(event: Event) {
    this.imageUploadService.handleImageUpload(event, async (result: string) => {
      this.uploadedImage = result;

      const response = await this.modalService.open({
        component: TicketPreviewComponentComponent,
        title: 'Ticket hochladen',
        buttonText: 'Hochladen',
        componentData: {
          ticketImage: this.uploadedImage,
        },
      });

      if (!response) return;

      this.gymTicketService.uploadGymTicket(this.uploadedImage).subscribe(() => {
        this.toastService.show('Erfolg', 'Ticket hochgeladen', ToastStatus.SUCESS);
      });
    });
  }
}
