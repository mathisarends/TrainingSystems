import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticket-preview-component',
  standalone: true,
  imports: [],
  templateUrl: './ticket-preview-component.component.html',
  styleUrls: ['./ticket-preview-component.component.scss'],
})
export class TicketPreviewComponentComponent {
  @Input({ required: true }) ticketImage!: string;
}
