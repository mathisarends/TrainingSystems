import { Component, OnInit } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { NotificationService } from '../../../shared/service/notification.service';
import { HeaderService } from '../../header/header.service';
import { TrainingDayNotificationComponent } from '../../usage-statistics/training-day-notification/training-day-notification.component';

@Component({
  standalone: true,
  imports: [TrainingDayNotificationComponent, AlertComponent],
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
