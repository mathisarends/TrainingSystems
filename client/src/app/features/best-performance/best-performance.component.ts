import { Component, computed, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { ChartSkeletonComponent } from '../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { UserBestPerformanceDto } from '../../shared/service/user-best-performance/user-best-performance.dto';

@Component({
  selector: 'app-best-performance',
  standalone: true,
  imports: [DashboardCardComponent, ChartSkeletonComponent, GroupedBarChartComponent],
  templateUrl: './best-performance.component.html',
  styleUrls: ['./best-performance.component.scss'],
})
export class BestPerformanceComponent implements OnInit {
  protected readonly IconName = IconName;

  squatPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  squatPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.squatPerformance()),
  );

  benchPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  benchPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.benchPerformance()),
  );

  deadliftPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  deadliftPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.deadliftPerformance()),
  );

  overheadpressPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  overheadpressPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.overheadpressPerformance()),
  );

  isInitialized = signal(false);

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.fetchUserBestPerformanceData().subscribe((response) => {
      this.squatPerformance.set(response['Squat']);
      this.benchPerformance.set(response['Bench']);
      this.deadliftPerformance.set(response['Deadlift']);
      this.overheadpressPerformance.set(response['Overheadpress']);
      this.isInitialized.set(true);
    });
  }

  private fetchUserBestPerformanceData(): Observable<{ [key: string]: UserBestPerformanceDto }> {
    return this.httpService.get<{ [key: string]: UserBestPerformanceDto }>('/user-best-performance');
  }

  private getDashboardCardComponentDataPerCategory(userBestPerformanceDto?: UserBestPerformanceDto) {
    if (!userBestPerformanceDto) {
      return undefined;
    }

    const prIncrement = this.getPrIncrement(userBestPerformanceDto);
    console.log('🚀 ~ BestPerformanceComponent ~ getDashboardCardComponentDataPerCategory ~ prIncrement:', prIncrement);

    return {
      title: userBestPerformanceDto.category + ' | ' + userBestPerformanceDto.exerciseName,
      iconBackgroundColor: IconBackgroundColor.BlueViolet,
      unit: userBestPerformanceDto.estMax,
      prIncrement: this.getPrIncrement(userBestPerformanceDto),
    };
  }

  private getPrIncrement(userBestPerformanceDto: UserBestPerformanceDto) {
    if (userBestPerformanceDto.previousRecords.length <= 1) {
      return userBestPerformanceDto.estMax;
    }

    return (
      userBestPerformanceDto.estMax -
      userBestPerformanceDto.previousRecords[userBestPerformanceDto.previousRecords.length - 1].estMax
    );
  }
}
