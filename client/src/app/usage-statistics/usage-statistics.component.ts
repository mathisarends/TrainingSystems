import { Component, OnInit } from '@angular/core';
import { ActivityCalendar } from '../activity-calendar/activity-calendar.component';
import { HttpService } from '../../service/http/http-client.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpinnerComponent } from '../components/loaders/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { ActivityCalendarData } from './activity-calendar-data';
import { TrainingDay } from '../Pages/training-view/training-day';
import { NotificationService } from '../notification-page/notification.service';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-usage-statistics',
  standalone: true,
  providers: [NotificationService],
  imports: [ActivityCalendar, SpinnerComponent, CommonModule, SkeletonComponent],
  templateUrl: './usage-statistics.component.html',
  styleUrls: ['./usage-statistics.component.scss'], // Corrected to styleUrls
})
export class UsageStatisticsComponent implements OnInit {
  /**
   * Observable that emits the exercise data as an object with day indices as keys and tonnage values, or null if there's an error or it's still loading.
   */
  activityCalendarData$!: Observable<ActivityCalendarData | null>;

  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  trainingDayNotifications$!: Observable<TrainingDay[]>;

  constructor(
    private httpClient: HttpService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.activityCalendarData$ = this.httpClient.get<ActivityCalendarData>('/user/activity-calendar');
    this.trainingDayNotifications$ = this.notificationService.getTrainingDayNotifications();
  }
}
