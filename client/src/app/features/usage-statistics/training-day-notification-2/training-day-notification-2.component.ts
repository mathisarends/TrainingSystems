import { Component, HostListener, input } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { IconName } from '../../../shared/icon/icon-name';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { TrainingDayNotificationComponent } from '../training-day-notification/training-day-notification.component';
import { TrainingDayFinishedNotification } from '../training-finished-notification';

@Component({
  selector: 'app-training-day-notification-2',
  templateUrl: './training-day-notification-2.component.html',
  styleUrls: ['./training-day-notification-2.component.scss'],
  standalone: true,
  imports: [FormatDatePipe],
})
export class TrainingDayNotification2Component {
  protected readonly IconName = IconName;
  notification = input.required<TrainingDayFinishedNotification>();

  constructor(private modalService: ModalService) {}

  @HostListener('click', ['$event'])
  protected showSummaryModal() {
    this.modalService.open({
      component: TrainingDayNotificationComponent,
      buttonText: 'Ansehen',
      secondaryButtonText: 'Teilen',
      size: ModalSize.LARGE,
      title: 'Test Überschrift',
      componentData: {
        notification: this.notification,
      },
    });
  }
}
