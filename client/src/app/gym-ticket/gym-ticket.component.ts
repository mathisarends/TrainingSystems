import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../../service/util/image-upload.service';
import { ModalService } from '../../service/modal/modalService';
import { TicketPreviewComponentComponent } from '../ticket-preview-component/ticket-preview-component.component';
import { GymTicketService } from './gym-ticket.service';
import { ToastService } from '../components/toast/toast.service';
import { ToastStatus } from '../components/toast/toast-status';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../components/loaders/spinner/spinner.component';
import { HeadlineComponent } from '../components/headline/headline.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

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
        this.toastService.show('Erfolg', 'Ticket hochgeladen', ToastStatus.SUCESS);
        this.loadGymTicket();
      });
    });
  }

  private loadGymTicket() {
    this.gymTicket$ = this.gymTicketService.getGymTicket();
  }
}
