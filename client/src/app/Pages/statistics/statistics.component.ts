import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../service/http/http-client.service';
import { SpinnerComponent } from '../../components/loaders/spinner/spinner.component';
import { TrainingExerciseTonnageDto } from './main-exercise-tonnage-dto';
import { Tonnage } from './tonnage';
import { MultiSelectComponent } from '../../multi-select/multi-select.component';
import { ChartColorService } from '../../chart-color.service';
import { firstValueFrom } from 'rxjs';
import { LineChartComponent } from '../../components/charts/line-chart/line-chart.component';
import { GroupedBarChartComponent } from '../../components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { BarChartData } from '../../components/charts/grouped-bar-chart/bar-chart.-data';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ExerciseDrillThroughEvent } from '../../components/charts/line-chart/exercise-drill-through-event';
import { ModalService } from '../../../service/modal/modalService';
import { PolarChartComponent } from '../../polar-chart/polar-chart.component';
import { HeadlineComponent } from '../../components/headline/headline.component';
import { ChartSkeletonComponent } from '../../components/loaders/chart-skeleton/chart-skeleton.component';
import { SkeletonCardComponent } from '../../skeleton-card/skeleton-card.component';

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
    GroupedBarChartComponent,
    PaginationComponent,
    HeadlineComponent,
    ChartSkeletonComponent,
    SkeletonCardComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  trainingPlanTitle: string = '';

  dataLoaded: boolean = false;
  currentView: 'volume' | 'performance' = 'volume';

  selectedExercises!: string[];
  allExercises!: string[];

  lineChartDatasets!: any[];
  lineChartLabels!: string[];

  groupedBarChartDatasets!: BarChartData[];
  groupedBarChartLabels!: string[];

  id!: string;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private chartColorService: ChartColorService,
    private modalService: ModalService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.id = this.router.url.split('/').pop()!;
    if (this.id) {
      await this.fetchInitialData(this.id);
    }
  }

  async changeDisplayCategories(newExercises: string[]) {
    this.updateLastViewedCategories(this.id, newExercises);

    if (this.id) {
      await this.fetchStatistics(this.id, newExercises);
    }
  }

  showDrillThroughGraph(drillThroughData: ExerciseDrillThroughEvent) {
    this.httpService
      .get(
        `/training/statistics/${this.id}/drilldown/${drillThroughData.exerciseName}/${drillThroughData.weekNumber - 1}`,
      )
      .subscribe((response: any) => {
        const data: number[] = response.exercises.map((exercise: any) => exercise.tonnage);
        const labels: string[] = response.exercises.map((exercise: any) => exercise.exercise);

        this.modalService.open({
          component: PolarChartComponent,
          title: ` Woche ${drillThroughData.weekNumber} - ${drillThroughData.exerciseName}`,
          hasFooter: false,
          buttonText: '',
          componentData: {
            data,
            labels,
          },
        });
      });
  }

  private async fetchInitialData(id: string): Promise<void> {
    try {
      const [allExercisesResponse, selectedExercisesResponse] = await Promise.all([
        firstValueFrom(this.httpService.get<any>(`/exercise/categories`)),
        firstValueFrom(this.httpService.get<any>(`/training/statistics/${id}/viewedCategories`)),
      ]);

      this.allExercises = allExercisesResponse;
      this.selectedExercises = selectedExercisesResponse;

      if (this.selectedExercises) {
        await this.fetchStatistics(id, this.selectedExercises);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }

  private async fetchStatistics(id: string, exercises: string[]): Promise<void> {
    try {
      const exercisesQuery = exercises.join(',');

      const [tonnageResponse, setsResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get<{
            title: string;
            data: Partial<TrainingExerciseTonnageDto>;
          }>(`/training/statistics/${id}?exercises=${exercisesQuery}`),
        ),
        firstValueFrom(this.httpService.get<any>(`/training/statistics/${id}/sets?exercises=${exercisesQuery}`)),
      ]);

      this.dataLoaded = true;
      this.initializeCharts(tonnageResponse.data, setsResponse, tonnageResponse.title);
    } catch (error) {
      console.error('Error fetching training statistics:', error);
    }
  }

  private initializeCharts(
    tonnageData: Partial<TrainingExerciseTonnageDto>,
    setsResponse: { [key: string]: number[] },
    title: string, // Neuer Parameter für den Titel
  ): void {
    // Setze den Titel des Trainingsplans
    this.trainingPlanTitle = title;

    // Setze Daten für das Liniendiagramm
    this.lineChartDatasets = Object.keys(tonnageData).map((categoryKey) => {
      const categoryData = tonnageData[categoryKey as keyof TrainingExerciseTonnageDto];
      return this.createTonnageDataSet(categoryKey, categoryData || []);
    });
    this.lineChartLabels = this.generateWeekLabels(this.lineChartDatasets[0]?.data.length || 0);

    // Setze Daten für das gruppierte Balkendiagramm
    this.groupedBarChartDatasets = Object.keys(setsResponse).map((categoryKey) => {
      const setsData = setsResponse[categoryKey];
      return this.createBarDataset(categoryKey, setsData || []);
    });
    this.groupedBarChartLabels = this.lineChartLabels;
  }

  private createTonnageDataSet(category: string, data: Tonnage[]): any {
    const colors = this.chartColorService.getCategoryColor(category);
    return {
      label: this.formatCategoryLabel(category),
      data: this.extractTonnageData(data),
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      fill: false,
    };
  }

  private createBarDataset(category: string, data: number[]): any {
    const colors = this.chartColorService.getCategoryColor(category);
    return {
      label: this.formatCategoryLabel(category),
      data: data, // Use the raw numbers of sets per week
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: 1,
    };
  }

  private extractTonnageData(data: Tonnage[]): number[] {
    return data.map((week) => week.tonnageInCategory);
  }

  private generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
  }

  private formatCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private updateLastViewedCategories(id: string, exericses: string[]) {
    const exercisesQueryParam = exericses.join(',');

    // Zuletzt besuchte Kategorien festse
    this.httpService
      .post(`/training/statistics/${id}/viewedCategories?exercises=${exercisesQueryParam}`)
      .subscribe(() => {});
  }

  changeView(index: number) {
    if (index == 0) {
      this.currentView === 'volume';
    } else {
      this.currentView === 'performance';
    }
  }
}
