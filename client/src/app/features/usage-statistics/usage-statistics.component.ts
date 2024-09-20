import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from '../../core/http-client.service';
import { BarChartData } from '../../shared/components/charts/grouped-bar-chart/bar-chart.-data';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { NotificationService } from '../../shared/service/notification.service';
import { ActivityCalendarData } from './activity-calendar-data';
import { ActivityCalendar } from './activity-calendar/activity-calendar.component';
import { RecentTrainingDurationsData } from './recent-training-durations-data';
import { TrainingDayNotificationComponent } from './training-day-notification/training-day-notification.component';
import { TrainingDayFinishedNotification } from './training-finished-notification';

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

  /**
   * Observable that emits both the BarChartData and labels.
   */
  recentTrainingDurations$!: Observable<{ chartData: BarChartData[]; labels: string[] }>;

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

    this.recentTrainingDurations$ = this.httpClient
      .get<RecentTrainingDurationsData[]>('/user/recent-training-durations')
      .pipe(
        map((trainingDurations: RecentTrainingDurationsData[]) => {
          // Extrahiere die Daten und Labels
          const dateLabels = trainingDurations.map((duration) => duration.date);
          const data = trainingDurations.map((duration) => duration.durationInMinutes);

          const groupedBarChartData: BarChartData[] = [
            {
              label: 'Trainingsdauer (Minuten)',
              data: data, // Extrahiere die Trainingsdauern
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 1,
            },
          ];

          return { chartData: groupedBarChartData, labels: dateLabels };
        }),
      );

    this.trainingDayNotifications$ = this.notificationService.getTrainingDayNotifications();
  }
}
