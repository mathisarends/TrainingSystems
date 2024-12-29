import { Component, computed, input } from '@angular/core';
import { UserBestPerformanceDto } from '../../../shared/service/user-best-performance/user-best-performance.dto';
import { IconBackgroundColor } from '../../../shared/components/icon-list-item/icon-background-color';
import { ChartData } from '../../../shared/components/charts/chart-data';
import { BarChartDataset } from '../../../shared/components/charts/grouped-bar-chart/bar-chart.-data-set';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';

@Component({
  standalone: true,
  imports: [DashboardCardComponent, GroupedBarChartComponent],
  selector: 'app-best-performance-category-section',
  templateUrl: './best-performance-category-section.component.html',
  styleUrls: ['./best-performance-category-section.component.scss'],
})
export class BestPerformanceCategorySectionComponent {
  categoryPerformanceData = input.required<UserBestPerformanceDto>();

  categoryPerformanceCardInfo = computed(() =>
    this.getDashboardCardComponentDataPerCategory(this.categoryPerformanceData()),
  );

  categoryChartData = computed(() => this.getBestPerformanceProgression(this.categoryPerformanceData()));

  private getDashboardCardComponentDataPerCategory(userBestPerformanceDto: UserBestPerformanceDto) {
    return {
      title: userBestPerformanceDto.category + ' | ' + userBestPerformanceDto.exerciseName,
      iconBackgroundColor: IconBackgroundColor.BlueViolet,
      unit: userBestPerformanceDto.estMax,
      prIncrement: this.getMostRecentPrIncrement(userBestPerformanceDto),
    };
  }

  private getBestPerformanceProgression(userBestPerformanceDto: UserBestPerformanceDto): ChartData<BarChartDataset> {
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

  private getMostRecentPrIncrement(userBestPerformanceDto: UserBestPerformanceDto): number {
    if (userBestPerformanceDto.previousRecords.length <= 1) {
      return userBestPerformanceDto.estMax;
    }

    return userBestPerformanceDto.estMax - userBestPerformanceDto.previousRecords[0].estMax;
  }
}
