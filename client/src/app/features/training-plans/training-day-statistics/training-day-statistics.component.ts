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
  /**
   * Indicates whether the data has been fully loaded.
   */
  isLoaded = signal(false);

  /**
   *  Holds the list of selected exercises.
   */
  selectedExercises: WritableSignal<string[]> = signal([]);

  /**
   * Holds the list of all available exercises.
   */
  allExercises: WritableSignal<string[]> = signal([]);

  /**
   * Holds the data for a line chart, including datasets and labels.
   */
  lineChartData = signal<LineChartData>({ datasets: [], labels: [] });

  /**
   * Holds the data for a grouped bar chart, including datasets and labels.
   */
  groupedBarChartData = signal<BarChartData>({ datasets: [], labels: [] });

  /**
   * The current training plan ID.
   */
  trainingPlanId = signal('');

  constructor(
    private router: Router,
    private chartColorService: ChartColorService,
    private trainingStatisticService: TrainingStatisticsService,
    private headerService: HeaderService,
    private destroyRef: DestroyRef,
    private injector: Injector,
  ) {}

  /**
   * Initializes the component by setting up data loading and category synchronization.
   */
  ngOnInit(): void {
    this.headerService.setLoading();

    this.trainingPlanId.set(this.parseTrainingPlanIdFromUrl());

    this.fetchAndSetCategoryMetadata();

    this.setupSelectedCategorySaveOnNavigationSync();

    effect(
      () => {
        if (this.isLoaded()) {
          this.fetchStatistics(this.trainingPlanId(), this.selectedExercises());
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Fetches category metadata including all categories and selected categories for a given ID,
   * then updates the component's state and fetches additional statistics.
   */
  private fetchAndSetCategoryMetadata(): void {
    forkJoin([
      this.trainingStatisticService.getAllCategories(),
      this.trainingStatisticService.getSelectedCategories(this.trainingPlanId()),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([allExercisesResponse, selectedExercisesResponse]) => {
        this.allExercises.set(allExercisesResponse);
        this.selectedExercises.set(selectedExercisesResponse);
        this.fetchStatistics(this.trainingPlanId(), this.selectedExercises());
      });
  }

  /**
   * Fetches statistics data (tonnage and sets) for the selected exercises and initializes charts.
   *
   * @param {string} id - The ID of the training plan or entity to fetch statistics for.
   * @param {string[]} exercises - The list of selected exercises to fetch statistics for.
   */
  private fetchStatistics(id: string, exercises: string[]): void {
    forkJoin({
      tonnage: this.trainingStatisticService.getTonnageDataForSelectedExercises(id, exercises),
      sets: this.trainingStatisticService.getSetDataForSelectedExercises(id, exercises),
      title: this.trainingStatisticService.getTrainingPlanTitle(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ tonnage, sets, title }) => {
        this.isLoaded.set(true);
        this.setHeadlineInfo(title);
        this.initializeCharts(tonnage.data, sets);
      });
  }

  /**
   * Sets the headline information for the page.
   * Updates the header with the given title and a fixed subtitle ('stats').
   *
   * @param title - The main title to display in the header.
   */
  private setHeadlineInfo(title: string): void {
    this.headerService.setHeadlineInfo({
      title: title,
      subTitle: 'stats',
    });
  }

  private initializeCharts(tonnageData: TrainingExerciseTonnageDto, setsResponse: { [key: string]: number[] }): void {
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

  private extractTonnageData(data: Tonnage[]): number[] {
    return data.map((week) => week.tonnageInCategory);
  }

  private generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
  }

  private formatCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private parseTrainingPlanIdFromUrl(): string {
    return this.router.url.split('/').pop()!;
  }

  /**
   * Sets up synchronization between navigation events and the backend.
   */
  private setupSelectedCategorySaveOnNavigationSync(): void {
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
