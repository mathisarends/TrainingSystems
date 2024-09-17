import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageUploadService } from '../../../service/util/image-upload.service';
import { HeadlineComponent } from '../../components/headline/headline.component';
import { ToastService } from '../../components/toast/toast.service';
import { ModalService } from '../../core/services/modal/modalService';
import { TicketPreviewComponentComponent } from '../../Pages/ticket-preview-component/ticket-preview-component.component';
import { SkeletonComponent } from '../../skeleton/skeleton.component';
import { GymTicketService } from './gym-ticket.service';

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
