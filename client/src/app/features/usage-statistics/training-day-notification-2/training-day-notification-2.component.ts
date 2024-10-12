import { Component, HostListener, input } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { IconName } from '../../../shared/icon/icon-name';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-training-day-notification-2',
  templateUrl: './training-day-notification-2.component.html',
  styleUrls: ['./training-day-notification-2.component.scss'],
  standalone: true,
  imports: [FormatDatePipe],
})
export class TrainingDayNotification2Component {
  protected readonly IconName = IconName;

  title = input.required<string>();
  id = input.required<string>();
  trainingDuration = input.required<number>();
  coverImage = input('/images/training/training_3.jpg');
  startDate = input.required<Date>();

  constructor(private modalService: ModalService) {}

  @HostListener('click', ['$event'])
  protected showSummaryModal() {
    this.modalService.openBasicInfoModal({
      infoText: 'Test',
      title: 'Test',
    });
  }

  // TODO: innerhalb von diesem modal dann mithilfe von lazy loading die relevatne trainingsdaten und links laden
  // TODO: wiggling animation for new entries
}
