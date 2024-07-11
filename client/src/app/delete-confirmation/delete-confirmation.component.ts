import { Component, Input } from '@angular/core';

import { AlertComponent } from '../components/alert/alert.component';
import { ModalEventsService } from '../../service/modal-events.service';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.scss',
})
export class DeleteConfirmationComponent {
  constructor(private modalEventsService: ModalEventsService) {}

  onSubmit(): void {
    this.modalEventsService.emitConfirmClick();
  }
}
