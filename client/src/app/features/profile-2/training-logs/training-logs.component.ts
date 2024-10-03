import { Component } from '@angular/core';
import { NotificationService } from '../../../shared/service/notification.service';
import { TrainingDayNotificationComponent } from '../../usage-statistics/training-day-notification/training-day-notification.component';

@Component({
  standalone: true,
  imports: [TrainingDayNotificationComponent],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
})
export class NameComponent {
  constructor(protected notificationService: NotificationService) {}
}
