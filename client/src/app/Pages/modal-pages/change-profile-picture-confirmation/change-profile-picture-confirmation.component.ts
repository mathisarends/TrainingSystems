import { Component, Input } from '@angular/core';
import { ModalEventsService } from '../../../../service/modal/modal-events.service';

@Component({
  selector: 'app-change-profile-picture-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './change-profile-picture-confirmation.component.html',
  styleUrl: './change-profile-picture-confirmation.component.scss',
})
export class ChangeProfilePictureConfirmationComponent {
  @Input() oldProfilePicture: string = '';
  @Input() newProfilePicture: string = '';

  constructor(private modalEventService: ModalEventsService) {}

  onSubmit(): void {
    this.modalEventService.emitConfirmClick();
  }
}
