import { Component, Input, OnInit } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';

@Component({
  selector: 'app-ticket-preview-component',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './ticket-preview-component.component.html',
  styleUrls: ['./ticket-preview-component.component.scss'],
})
export class TicketPreviewComponentComponent implements OnInit {
  @Input({ required: true }) ticketImage!: string;

  ngOnInit(): void {
    // Accessing the value of the input signal correctly
    console.log('🚀 ~ TicketPreviewComponentComponent ~ ticketImg:', this.ticketImage);
  }
}
