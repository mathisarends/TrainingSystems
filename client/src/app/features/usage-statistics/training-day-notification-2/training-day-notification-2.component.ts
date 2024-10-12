import { Component, HostListener, Input } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { IconName } from '../../../shared/icon/icon-name';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ProfileService } from '../../profile-2/service/profileService';

@Component({
  selector: 'app-training-day-notification-2',
  templateUrl: './training-day-notification-2.component.html',
  styleUrls: ['./training-day-notification-2.component.scss'],
  standalone: true,
  imports: [FormatDatePipe],
})
export class TrainingDayNotification2Component {
  protected readonly IconName = IconName;
  protected date = new Date();

  @Input() title: string = 'Morning Vinyasa'; // Training title
  @Input() trainer: string = 'Giovanna L.'; // Trainer's name
  @Input() duration: string = '45m'; // Duration of the training
  @Input() imageUrl: string = '/images/training/training_3.jpg'; // Default image

  constructor(
    protected profileService: ProfileService,
    private modalService: ModalService,
  ) {}

  @HostListener('click', ['$event'])
  protected showSummaryModal() {
    this.modalService.openBasicInfoModal({
      infoText: 'Test',
      title: 'Test',
    });
  }
}
