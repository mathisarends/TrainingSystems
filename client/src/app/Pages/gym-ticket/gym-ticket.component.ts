import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SpinnerComponent } from '../../components/loaders/spinner/spinner.component';
import { ToastService } from '../../components/toast/toast.service';
import { ModalService } from '../../core/services/modal/modalService';
import { HeadlineComponent } from '../../shared/components/headline/headline.component';
import { ImageUploadService } from '../../shared/image-upload.service';
import { SkeletonComponent } from '../../skeleton/skeleton.component';
import { TicketPreviewComponentComponent } from '../ticket-preview-component/ticket-preview-component.component';
import { GymTicketService } from './gym-ticket.service';

@Component({
  selector: 'app-gym-ticket',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, HeadlineComponent, SkeletonComponent],
  templateUrl: './gym-ticket.component.html',
  styleUrls: ['./gym-ticket.component.scss'],
})
export class GymTicketComponent implements OnInit {
  protected readonly NO_GYM_TICKET_AVAILABLE = 'noGymTicketAvailable';

  uploadedImage: string | null = null;

  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  gymTicket$!: Observable<string>;

  constructor(
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private toastService: ToastService,
    private gymTicketService: GymTicketService,
  ) {}

  ngOnInit(): void {
    this.loadGymTicket();
  }

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
        this.toastService.success('Ticket hochgeladen');
        this.loadGymTicket();
      });
    });
  }

  private loadGymTicket() {
    this.gymTicket$ = this.gymTicketService.getGymTicket();
  }
}
