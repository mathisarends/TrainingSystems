import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalService } from '../../core/services/modal/modalService';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../shared/service/image-upload.service';
import { GymTicketService } from './gym-ticket.service';
import { TicketPreviewComponentComponent } from './ticket-preview-component/ticket-preview-component.component';

@Component({
  selector: 'app-gym-ticket',
  standalone: true,
  imports: [CommonModule, HeadlineComponent, SkeletonComponent],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
})
export class GymTicketComponent implements OnInit {
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  gymTicket$!: Observable<string>;

  constructor(
    private modalService: ModalService,
    private imageUploadService: ImageUploadService,
    private toastService: ToastService,
    private gymTicketService: GymTicketService,
  ) {}

  ngOnInit(): void {
    this.gymTicket$ = this.gymTicketService.getGymTicket();
  }

  protected async handleImageUpload(event: Event) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    const response = await this.modalService.open({
      component: TicketPreviewComponentComponent,
      title: 'Ticket hochladen',
      buttonText: 'Hochladen',
      componentData: {
        ticketImage: uploadedImageBase64Str,
      },
    });

    if (response) {
      this.gymTicketService.uploadGymTicket(uploadedImageBase64Str).subscribe(() => {
        this.toastService.success('Ticket hochgeladen');
        this.gymTicket$ = this.gymTicketService.getGymTicket();
      });
    }
  }
}
