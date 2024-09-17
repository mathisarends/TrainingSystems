import { Component, Input } from '@angular/core';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-ticket-preview-component',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './ticket-preview-component.component.html',
  styleUrls: ['./ticket-preview-component.component.scss'],
})
export class TicketPreviewComponentComponent {
  @Input({ required: true }) ticketImage!: string;
}
