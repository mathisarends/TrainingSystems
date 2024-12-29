import { Component, computed, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { ChartSkeletonComponent } from '../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { IconName } from '../../shared/icon/icon-name';
import { UserBestPerformanceDto } from '../../shared/service/user-best-performance/user-best-performance.dto';
import { ChartData } from '../../shared/components/charts/chart-data';
import { BarChartDataset } from '../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { GroupedBarChartComponent } from '../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';

// TODO: nach dem fix der historie hier weiter machen
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
  squatChartData = computed(() => {
    if (!this.squatPerformance()) {
      return undefined;
    }
    return this.getBestPerformanceProgression(this.squatPerformance()!);
  });

  benchPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  benchPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.benchPerformance()),
  );
  benchChartData = computed(() => {
    if (!this.benchPerformance()) {
      return undefined;
    }
    return this.getBestPerformanceProgression(this.benchPerformance()!);
  });

  deadliftPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  deadliftPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.deadliftPerformance()),
  );
  deadliftChartData = computed(() => {
    if (!this.deadliftPerformance()) {
      return undefined;
    }
    return this.getBestPerformanceProgression(this.deadliftPerformance()!);
  });

  overheadpressPerformance = signal<UserBestPerformanceDto | undefined>(undefined);
  overheadpressPerformanceDashboardCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.overheadpressPerformance()),
  );
  overheadpressChartData = computed(() => {
    if (!this.overheadpressPerformance()) {
      return undefined;
    }
    return this.getBestPerformanceProgression(this.overheadpressPerformance()!);
  });

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

  private getBestPerformanceProgression(
    userBestPerformanceDto: UserBestPerformanceDto,
  ): ChartData<BarChartDataset> | undefined {
    const labels = userBestPerformanceDto.previousRecords.map((previousRecord) => {
      const achievedAtFormatted = new Date(previousRecord.achievedAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
      return `${userBestPerformanceDto.exerciseName} ${achievedAtFormatted}`;
    });

    const data = userBestPerformanceDto.previousRecords.map((previousRecord) => previousRecord.estMax);

    const datasets: BarChartDataset[] = [
      {
        label: `${userBestPerformanceDto.exerciseName} PR`,
        data: data,
        backgroundColor: 'rgba(99, 132, 255, 0.6)',
        borderColor: 'rgba(99, 132, 255, 1)',
      },
    ];

    return {
      labels: labels,
      datasets: datasets,
    };
  }

  private getDashboardCardComponentDataPerCategory(userBestPerformanceDto?: UserBestPerformanceDto) {
    if (!userBestPerformanceDto) {
      return undefined;
    }

    this.getBestPerformanceProgression(userBestPerformanceDto);

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

    return userBestPerformanceDto.estMax - userBestPerformanceDto.previousRecords[0].estMax;
  }
}
