import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { BarChartDataset } from '../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { ChartSkeletonComponent } from '../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { NotificationService } from '../../shared/service/notification.service';
import { HeaderService } from '../header/header.service';
import { ActivityCalendarData } from './activity-calendar-data';
import { ActivityCalendar } from './activity-calendar/activity-calendar.component';
import { RecentTrainingDurationsData } from './recent-training-durations-data';
import { TrainingDayNotificationComponent } from './training-day-notification/training-day-notification.component';
import { UsageStatisticsService } from './usage.-statistics.service';

@Component({
  selector: 'app-usage-statistics',
  standalone: true,
  imports: [
    ActivityCalendar,
    CommonModule,
    SkeletonComponent,
    TrainingDayNotificationComponent,
    GroupedBarChartComponent,
    ChartSkeletonComponent,
  ],
  templateUrl: './usage-statistics.component.html',
  styleUrls: ['./usage-statistics.component.scss'],
  providers: [UsageStatisticsService, ImageDownloadService],
})
export class UsageStatisticsComponent implements OnInit {
  /**
   * Observable that emits both activity calendar data and recent training durations data.
   */
  usageStatisticsData$!: Observable<{
    activityCalendarData: ActivityCalendarData;
    recentTrainingDurations: { datasets: BarChartDataset[]; labels: string[] };
  }>;

  constructor(
    protected notificationService: NotificationService,
    private usageStatisticsService: UsageStatisticsService,
    private headerService: HeaderService,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Usage',
    });

    this.usageStatisticsData$ = forkJoin({
      activityCalendarData: this.usageStatisticsService.getActivityCalendarData(),
      recentTrainingDurations: this.usageStatisticsService.getRecentTrainingDurationsData().pipe(
        map((trainingDurations: RecentTrainingDurationsData[]) => {
          const dateLabels = trainingDurations.map((duration) => duration.date);
          const data = trainingDurations.map((duration) => duration.durationInMinutes);

          const groupedBarChartData: BarChartDataset[] = [
            {
              label: 'Trainingsdauer (Minuten)',
              data: data,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
          ];

          return { datasets: groupedBarChartData, labels: dateLabels };
        }),
      ),
    });
  }
}
