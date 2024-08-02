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
import { LineChartComponent } from '../../line-chart/line-chart.component';
import { PieChartComponent } from '../../pie-chart/pie-chart.component';

/**
 * Component responsible for displaying training statistics in a line chart.
 * The chart shows the tonnage (weight lifted) for different exercise categories over multiple weeks.
 */
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    SpinnerComponent,
    MultiSelectComponent,
    LineChartComponent,
    PieChartComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  // TODO: statistic component refactor

  dataLoaded: boolean = false;

  selectedExercises!: string[];
  allExercises!: string[];

  lineChartDatasets!: any[];
  lineChartLabels!: string[];

  pieChartData!: number[];
  pieChartLabels!: string[];
  pieChartBackgroundColors!: string[];

  constructor(
    private router: Router,
    private httpService: HttpClientService,
    private chartColorService: ChartColorService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.router.url.split('/').pop();
    await this.fetchTrainingStatistics(id);
  }

  changeDisplayCategories(newExercises: string[]) {
    const id = this.router.url.split('/').pop();
    const exercises = newExercises.join(',');

    this.httpService
      .request<Partial<TrainingExerciseTonnageDto>>(
        HttpMethods.GET,
        `training/statistics/${id}?exercises=${exercises}`
      )
      .subscribe((response) => {
        this.dataLoaded = true;
        this.initializeCharts(response);
      });
  }

  async fetchTrainingStatistics(id: string | undefined): Promise<void> {
    try {
      // Führe beide Anfragen parallel aus und warte auf beide
      const [allExercisesResponse, selectedExercisesResponse] =
        await Promise.all([
          firstValueFrom(
            this.httpService.request<any>(
              HttpMethods.GET,
              `exercise/categories`
            )
          ),
          firstValueFrom(
            this.httpService.request<any>(
              HttpMethods.GET,
              `training/statistics/${id}/viewedCategories`
            )
          ),
        ]);

      this.allExercises = allExercisesResponse;
      this.selectedExercises = selectedExercisesResponse;

      this.httpService
        .request<Partial<TrainingExerciseTonnageDto>>(
          HttpMethods.GET,
          `training/statistics/${id}?exercises=${this.selectedExercises}`
        )
        .subscribe((response) => {
          this.dataLoaded = true;
          this.initializeCharts(response);
        });
    } catch (error) {
      console.error('Error fetching training statistics:', error);
    }
  }

  initializeCharts(data: Partial<TrainingExerciseTonnageDto>): void {
    // Set data for the line chart
    this.lineChartDatasets = Object.keys(data).map((categoryKey) => {
      const categoryData =
        data[categoryKey as keyof TrainingExerciseTonnageDto];
      return this.createDataset(categoryKey, categoryData || []);
    });
    this.lineChartLabels = this.generateWeekLabels(
      this.lineChartDatasets[0]?.data.length || 0
    );

    // Set data for the pie chart
    this.pieChartData = Object.keys(data).map((categoryKey) => {
      const categoryData =
        data[categoryKey as keyof TrainingExerciseTonnageDto] || [];
      return this.calculateTotalTonnage(categoryData);
    });
    this.pieChartLabels = Object.keys(data).map((categoryKey) =>
      this.formatCategoryLabel(categoryKey)
    );
    this.pieChartBackgroundColors = this.pieChartLabels.map(
      (label) =>
        this.chartColorService.getCategoryColor(label.toLowerCase())
          .backgroundColor
    );
  }

  createDataset(category: string, data: Tonnage[]): any {
    const colors = this.chartColorService.getCategoryColor(category);
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

  calculateTotalTonnage(data: Tonnage[]): number {
    return data.reduce((total, week) => total + week.tonnageInCategory, 0);
  }
}
