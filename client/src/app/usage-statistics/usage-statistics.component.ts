import { Component, OnInit } from '@angular/core';
import { ActivityCalendar } from '../activity-calendar/activity-calendar.component';
import { HttpService } from '../../service/http/http-client.service';
import { map, Observable } from 'rxjs';
import { SpinnerComponent } from '../components/loaders/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { ActivityCalendarData } from './activity-calendar-data';
import { NotificationService } from '../notification-page/notification.service';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { TrainingDayFinishedNotification } from './training-finished-notification';
import { TrainingDayNotificationComponent } from '../training-day-notification/training-day-notification.component';
import { GroupedBarChartComponent } from '../components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { BarChartData } from '../components/charts/grouped-bar-chart/bar-chart.-data';

@Component({
  selector: 'app-usage-statistics',
  standalone: true,
  imports: [
    ActivityCalendar,
    SpinnerComponent,
    CommonModule,
    SkeletonComponent,
    TrainingDayNotificationComponent,
    GroupedBarChartComponent,
  ],
  templateUrl: './usage-statistics.component.html',
  styleUrls: ['./usage-statistics.component.scss'], // Corrected to styleUrls
})
export class UsageStatisticsComponent implements OnInit {
  /**
   * Observable that emits the exercise data as an object with day indices as keys and tonnage values, or null if there's an error or it's still loading.
   */
  activityCalendarData$!: Observable<ActivityCalendarData | null>;

  recentTrainingDurations$!: Observable<BarChartData[]>;

  /**
   * Observable that emits the exercise data or null if there's an error or it's still loading.
   */
  trainingDayNotifications$!: Observable<TrainingDayFinishedNotification[]>;

  constructor(
    private httpClient: HttpService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.activityCalendarData$ = this.httpClient.get<ActivityCalendarData>('/user/activity-calendar');
    this.recentTrainingDurations$ = this.httpClient.get<number[]>('/user/recent-training-durations').pipe(
      map((trainingDurations: number[]) => {
        const groupedBarChartData: BarChartData[] = [
          {
            label: 'Trainingsdauer (Minuten)',
            data: trainingDurations, // Ensure this is of type number[]
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 1,
          },
        ];
        return groupedBarChartData;
      }),
    );
    this.trainingDayNotifications$ = this.notificationService.getTrainingDayNotifications();
  }
}
