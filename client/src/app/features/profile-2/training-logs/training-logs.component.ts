import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { NotificationService } from '../../../shared/service/notification.service';
import { HeaderService } from '../../header/header.service';
import { TrainingDayNotification2Component } from '../../usage-statistics/training-day-notification-2/training-day-notification-2.component';
import { TrainingDayFinishedNotification } from '../../usage-statistics/training-finished-notification';

@Component({
  standalone: true,
  imports: [TrainingDayNotification2Component, AlertComponent, SpinnerComponent, AsyncPipe],
  selector: 'app-training-logs',
  templateUrl: 'training-logs.component.html',
  styleUrls: ['./training-logs.component.scss'],
})
export class TrainingLogsComponent implements OnInit, AfterViewInit {
  trainingDayNotifications$!: Observable<TrainingDayFinishedNotification[]>;

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Logs',
    });

    this.trainingDayNotifications$ = this.httpService.get<TrainingDayFinishedNotification[]>(
      '/user/activity/training-notifications',
    );
  }

  ngAfterViewInit(): void {
    this.httpService.delete('/user/activity/unseen-training-notifications').subscribe(() => {
      console.log('here');
    });
  }
}
