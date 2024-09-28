import { Component, DestroyRef, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BarChartData } from '../../../shared/components/charts/grouped-bar-chart/bar-chart-data';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { LineChartDataset } from '../../../shared/components/charts/line-chart/lilne-chart-data-set';
import { LineChartData } from '../../../shared/components/charts/line-chart/line-chart-data';
import { LineChartComponent } from '../../../shared/components/charts/line-chart/line-chart.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { ChartSkeletonComponent } from '../../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { KeyboardService } from '../../../shared/service/keyboard.service';
import { HeaderService } from '../../header/header.service';
import { ChangeProfilePictureConfirmationComponent } from '../../profile-2/change-profile-picture-confirmation/change-profile-picture-confirmation.component';
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
    ChangeProfilePictureConfirmationComponent,
    PaginationComponent,
  ],
  providers: [TrainingStatisticsService, KeyboardService, PaginationComponent],
  templateUrl: './training-day-statistics.component.html',
  styleUrls: ['./training-day-statistics.component.scss'],
})
export class TrainingDayStatisticsComponent implements OnInit {
  isLoaded = signal(false);

  selectedExercises: WritableSignal<string[]> = signal([]);

  allExercises: WritableSignal<string[]> = signal([]);

  lineChartData = signal<LineChartData>({ datasets: [], labels: [] });

  groupedBarChartData = signal<BarChartData>({ datasets: [], labels: [] });

  trainingPlanId = signal('');

  constructor(
    private router: Router,
    private chartColorService: ChartColorService,
    private trainingStatisticService: TrainingStatisticsService,
    private headerService: HeaderService,
    private destroyRef: DestroyRef,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    this.headerService.setLoading();

    this.parseAndSetTrainingPlanId();

    this.fetchAndSetCategoryMetadata(this.trainingPlanId());

    this.setupNavigationSync();

    effect(
      () => {
        if (this.isLoaded()) {
          this.changeDisplayCategories();
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  private fetchAndSetCategoryMetadata(id: string): void {
    forkJoin([
      this.trainingStatisticService.getAllCategories(),
      this.trainingStatisticService.getSelectedCategories(id),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([allExercisesResponse, selectedExercisesResponse]) => {
        this.allExercises.set(allExercisesResponse);
        this.selectedExercises.set(selectedExercisesResponse);
        this.fetchStatistics(id, this.selectedExercises());
      });
  }

  private fetchStatistics(id: string, exercises: string[]): void {
    forkJoin([
      this.trainingStatisticService.getTonnageDataForSelectedExercises(id, exercises),
      this.trainingStatisticService.getSetDataForSelectedExercises(id, exercises),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([tonnageResponse, setsResponse]) => {
        this.isLoaded.set(true);
        this.initializeCharts(tonnageResponse.data, setsResponse, tonnageResponse.title);
      });
  }
  private initializeCharts(
    tonnageData: Partial<TrainingExerciseTonnageDto>,
    setsResponse: { [key: string]: number[] },
    title: string,
  ): void {
    this.headerService.setHeadlineInfo({
      title: title,
      subTitle: 'stats',
    });

    // Line chart setup
    const lineDatasets = Object.keys(tonnageData).map((categoryKey) => {
      const categoryData = tonnageData[categoryKey as keyof TrainingExerciseTonnageDto];
      return this.createTonnageDataSet(categoryKey, categoryData || []);
    });

    const lineLabels = this.generateWeekLabels(lineDatasets[0]?.data.length || 0);
    this.lineChartData.set({ datasets: lineDatasets, labels: lineLabels });

    // Bar chart setup
    const barDatasets = Object.keys(setsResponse).map((categoryKey) => {
      const setsData = setsResponse[categoryKey];
      return this.createBarDataset(categoryKey, setsData || []);
    });

    this.groupedBarChartData.set({ datasets: barDatasets, labels: lineLabels });
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

  private parseAndSetTrainingPlanId(): void {
    this.trainingPlanId.set(this.router.url.split('/').pop()!);
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

  private changeDisplayCategories() {
    this.fetchStatistics(this.trainingPlanId(), this.selectedExercises());
  }

  /**
   * Sets up synchronization between navigation events and the backend.
   */
  private setupNavigationSync(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.syncCategoriesWithBackend();
      }
    });
  }

  /**
   * Synchronizes selected categories with the backend.
   */
  private syncCategoriesWithBackend(): void {
    this.trainingStatisticService
      .updateLastViewedCategories(this.trainingPlanId(), this.selectedExercises())
      .subscribe(() => {
        console.log('Categories synchronized with backend.');
      });
  }
}
