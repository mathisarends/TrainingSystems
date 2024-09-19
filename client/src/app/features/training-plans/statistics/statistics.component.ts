import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BarChartData } from '../../../components/charts/grouped-bar-chart/bar-chart.-data';
import { GroupedBarChartComponent } from '../../../components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { ExerciseDrillThroughEvent } from '../../../components/charts/line-chart/exercise-drill-through-event';
import { LineChartDataset } from '../../../components/charts/line-chart/lilne-chart-data-set';
import { LineChartComponent } from '../../../components/charts/line-chart/line-chart.component';
import { PolarChartComponent } from '../../../components/charts/polar-chart/polar-chart.component';
import { ChartSkeletonComponent } from '../../../components/loaders/chart-skeleton/chart-skeleton.component';
import { ModalService } from '../../../core/services/modal/modalService';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { HeadlineService } from '../../../shared/components/headline/headline.service';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { ChartColorService } from '../training-view/services/chart-color.service';
import { TrainingExerciseTonnageDto } from './main-exercise-tonnage-dto';
import { Tonnage } from './tonnage';
import { TrainingStatisticsService } from './training-statistics.service';

/**
 * Component responsible for displaying training statistics in a line chart.
 * The chart shows the tonnage (weight lifted) for different exercise categories over multiple weeks.
 */
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    MultiSelectComponent,
    LineChartComponent,
    GroupedBarChartComponent,
    HeadlineComponent,
    ChartSkeletonComponent,
  ],
  providers: [TrainingStatisticsService],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  dataLoaded: boolean = false;

  selectedExercises!: string[];
  allExercises!: string[];

  lineChartDatasets!: LineChartDataset[];
  lineChartLabels!: string[];

  groupedBarChartDatasets!: BarChartData[];
  groupedBarChartLabels!: string[];

  id!: string;

  constructor(
    private router: Router,
    private chartColorService: ChartColorService,
    private modalService: ModalService,
    private trainingStatisticService: TrainingStatisticsService,
    private headlineService: HeadlineService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.id = this.router.url.split('/').pop()!;
    if (this.id) {
      await this.fetchInitialData(this.id);
    }
  }

  async changeDisplayCategories(newExercises: string[]) {
    this.trainingStatisticService.updateLastViewedCategories(this.id, newExercises).subscribe(() => {});

    if (this.id) {
      await this.fetchStatistics(this.id, newExercises);
    }
  }

  showDrillThroughGraph(drillThroughData: ExerciseDrillThroughEvent) {
    this.trainingStatisticService
      .getDrillThroughForSpecificExerciseCategory(this.id, drillThroughData.exerciseName, drillThroughData.weekNumber)
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
    const [allExercisesResponse, selectedExercisesResponse] = await Promise.all([
      firstValueFrom(this.trainingStatisticService.getAllCategories()),
      firstValueFrom(this.trainingStatisticService.getSelectedCategories(id)),
    ]);

    this.allExercises = allExercisesResponse;
    this.selectedExercises = selectedExercisesResponse;

    if (this.selectedExercises) {
      await this.fetchStatistics(id, this.selectedExercises);
    }
  }

  private async fetchStatistics(id: string, exercises: string[]): Promise<void> {
    const [tonnageResponse, setsResponse] = await Promise.all([
      firstValueFrom(this.trainingStatisticService.getTonnageDataForSelectedExercises(id, exercises)),
      firstValueFrom(this.trainingStatisticService.getSetDataForSelectedExercises(id, exercises)),
    ]);

    this.dataLoaded = true;

    this.initializeCharts(tonnageResponse.data, setsResponse, tonnageResponse.title);
  }

  private initializeCharts(
    tonnageData: Partial<TrainingExerciseTonnageDto>,
    setsResponse: { [key: string]: number[] },
    title: string,
  ): void {
    // Setze den Titel des Trainingsplans
    this.headlineService.subTitle.set('stats');
    this.headlineService.title.set(title);
    this.headlineService.isTitleLoading.set(false);

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

  private createTonnageDataSet(category: string, data: Tonnage[]): LineChartDataset {
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
}
