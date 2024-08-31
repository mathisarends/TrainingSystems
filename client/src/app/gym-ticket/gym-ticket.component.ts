import { Component } from '@angular/core';
import { ImageUploadService } from '../../service/util/image-upload.service';
import { ModalService } from '../../service/modal/modalService';
import { TicketPreviewComponentComponent } from '../ticket-preview-component/ticket-preview-component.component';

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
  ) {}

  handleImageUpload(event: Event) {
    this.imageUploadService.handleImageUpload(event, (result: string) => {
      console.log('🚀 ~ GymTicketComponent ~ handleImageUpload ~ result:', result);
      this.uploadedImage = result;

      this.modalService.open({
        component: TicketPreviewComponentComponent,
        title: 'Ticket hochladen',
        buttonText: 'Hochladen',
        componentData: {
          ticketImage: this.uploadedImage,
        },
      });
    });
  }
}
