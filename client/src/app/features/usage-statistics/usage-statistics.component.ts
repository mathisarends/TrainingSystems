import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { ChartSkeletonComponent } from '../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { NotificationService } from '../../shared/service/notification.service';
import { HeaderService } from '../header/header.service';
import { ActivityCalendar } from './activity-calendar/activity-calendar.component';
import { TrainingDayNotificationComponent } from './training-day-notification/training-day-notification.component';

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
  providers: [ImageDownloadService],
})
export class UsageStatisticsComponent implements OnInit {
  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Usage',
    });
  }
}
