import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingExerciseTonnageDto } from './main-exercise-tonnage-dto';
import { Tonnage } from './tonnage';
import { MultiSelectComponent } from '../../multi-select/multi-select.component';
import { ChartColorService } from '../../chart-color.service';
import { firstValueFrom } from 'rxjs';

/**
 * Component responsible for displaying training statistics in a line chart.
 * The chart shows the tonnage (weight lifted) for different exercise categories over multiple weeks.
 */
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [SpinnerComponent, MultiSelectComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  lineChart: any;
  pieChart: any;

  dataLoaded: boolean = false;

  selectedExercises!: string[];
  allExercises!: string[];

  constructor(
    private router: Router,
    private httpService: HttpClientService,

    private chartColorService: ChartColorService // Inject the ColorService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.router.url.split('/').pop();
    await this.fetchTrainingStatistics(id);
  }

  changeDisplayCategories(newExercises: string[]) {
    const id = this.router.url.split('/').pop();

    const exercises = newExercises.join(',');

    this.httpService
      .request<any>(
        HttpMethods.POST,
        `training/statistics/${id}/viewedCategories?exercises=${exercises}`
      )
      .subscribe((response) => {});

    this.httpService
      .request<Partial<TrainingExerciseTonnageDto>>(
        HttpMethods.GET,
        `training/statistics/${id}?exercises=${exercises}`
      )
      .subscribe((response) => {
        console.log(
          '🚀 ~ StatisticsComponent ~ .subscribe ~ response:',
          response
        );
        this.dataLoaded = true;
        this.initializeChart(response);
        this.createPieChart(response);
      });
  }

  async fetchTrainingStatistics(id: string | undefined): Promise<void> {
    this.allExercises = await firstValueFrom(
      this.httpService.request<any>(HttpMethods.GET, `exercise/categories`)
    );

    this.selectedExercises = await firstValueFrom(
      this.httpService.request<any>(
        HttpMethods.GET,
        `training/statistics/${id}/viewedCategories`
      )
    );

    this.httpService
      .request<Partial<TrainingExerciseTonnageDto>>(
        HttpMethods.GET,
        `training/statistics/${id}?exercises=${this.selectedExercises}`
      )
      .subscribe((response) => {
        console.log(
          '🚀 ~ StatisticsComponent ~ .subscribe ~ response:',
          response
        );
        this.dataLoaded = true;
        this.initializeChart(response);
        this.createPieChart(response);
      });
  }

  initializeChart(data: Partial<TrainingExerciseTonnageDto>): void {
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const datasets = Object.keys(data).map((categoryKey) => {
      const categoryData =
        data[categoryKey as keyof TrainingExerciseTonnageDto];
      return this.createDataset(categoryKey, categoryData || []);
    });

    const labels = this.generateWeekLabels(datasets[0]?.data.length || 0);

    this.lineChart = new Chart('lineChart', {
      type: 'line',
      data: {
        labels: labels, // Use dynamically generated labels
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tonnage (kg)',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y + ' kg';
              },
            },
          },
        },
      },
    });
  }

  createDataset(category: string, data: Tonnage[]): any {
    const colors = this.chartColorService.getCategoryColor(category); // Use the ColorService
    return {
      label: this.formatCategoryLabel(category),
      data: this.extractTonnageData(data),
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      fill: false,
    };
  }

  extractTonnageData(data: Tonnage[]): number[] {
    return data.map((week) => week.tonnageInCategory);
  }

  generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
  }

  formatCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  createPieChart(data: Partial<TrainingExerciseTonnageDto>): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const categoryTotals = Object.keys(data).map((categoryKey) => {
      const categoryData =
        data[categoryKey as keyof TrainingExerciseTonnageDto] || [];
      return this.calculateTotalTonnage(categoryData);
    });

    const labels = Object.keys(data).map((categoryKey) =>
      this.formatCategoryLabel(categoryKey)
    );
    const backgroundColors = labels.map(
      (label) =>
        this.chartColorService.getCategoryColor(label.toLowerCase())
          .backgroundColor // Use the ColorService
    );

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart('MyPieChart', {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: categoryTotals,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.raw + ' kg';
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tonnage (anteilig)',
            },
          },
        },
      },
    });
  }

  calculateTotalTonnage(data: Tonnage[]): number {
    return data.reduce((total, week) => total + week.tonnageInCategory, 0);
  }
}
