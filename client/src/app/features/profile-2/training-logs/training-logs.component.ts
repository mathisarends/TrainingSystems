import { Component } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { NotificationService } from '../../../shared/service/notification.service';
import { TrainingDayNotificationComponent } from '../../usage-statistics/training-day-notification/training-day-notification.component';

@Component({
  standalone: true,
  imports: [TrainingDayNotificationComponent, AlertComponent],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
})
export class TrainingLogsComponent {
  constructor(protected notificationService: NotificationService) {}
}
