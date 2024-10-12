import { Component, OnInit } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { NotificationService } from '../../../shared/service/notification.service';
import { HeaderService } from '../../header/header.service';
import { TrainingDayNotification2Component } from '../../usage-statistics/training-day-notification-2/training-day-notification-2.component';
import { TrainingDayNotificationComponent } from '../../usage-statistics/training-day-notification/training-day-notification.component';

@Component({
  standalone: true,
  imports: [TrainingDayNotificationComponent, TrainingDayNotification2Component, AlertComponent],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
})
export class TrainingLogsComponent implements OnInit {
  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Logs',
    });
  }
}
