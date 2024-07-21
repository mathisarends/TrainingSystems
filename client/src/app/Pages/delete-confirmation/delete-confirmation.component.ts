import { Component, Input } from '@angular/core';

import { AlertComponent } from '../../components/alert/alert.component';
import { ModalEventsService } from '../../../service/modal/modal-events.service';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.scss',
})
export class DeleteConfirmationComponent {
  @Input() id?: string;

  constructor(private modalEventsService: ModalEventsService) {}

  onSubmit(): void {
    if (!this.id) {
      throw new Error(
        'There has to be an id to uniquely identify the resource to delete'
      );
    }

    this.modalEventsService.emitConfirmClick(this.id);
  }
}
