import { Component, DestroyRef, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ChartData } from '../../../shared/components/charts/chart-data';
import { LineChartDataset, PolarAreaChartDataset } from '../../../shared/components/charts/chart-dataset';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { LineChartComponent } from '../../../shared/components/charts/line-chart/line-chart.component';
import { PolarChartComponent } from '../../../shared/components/charts/polar-chart/polar-chart.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { ChartSkeletonComponent } from '../../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { ToSelectItemPipe } from '../../../shared/components/select/to-select-item.pipe';
import { KeyboardService } from '../../../shared/service/keyboard.service';
import { HeaderService } from '../../header/header.service';
import { ChangeProfilePictureConfirmationComponent } from '../../profile-2/change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ChartColorService } from '../training-view/services/chart-color.service';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { AverageTrainingDayDurationDto } from './average-training-duration-dto';
import { LineChartDataDTO } from './line-chart-data-dto';
import { TrainingDayChartType } from './training-day-chart-type';
import { TrainingStatisticsService } from './training-statistics.service';

/**
 * Component responsible for displaying training statistics in a line chart.
 * The chart shows the tonnage (weight lifted) for different exercise categories over multiple weeks.
 */
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    SelectComponent,
    DropdownComponent,
    LineChartComponent,
    GroupedBarChartComponent,
    HeadlineComponent,
    ChartSkeletonComponent,
    ChangeProfilePictureConfirmationComponent,
    ToSelectItemPipe,
    PolarChartComponent,
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
   * The current training plan ID.
   */
  trainingPlanId = signal('');

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
  volumeChartData = signal<ChartData<LineChartDataset>>({ datasets: [], labels: [] });

  performanceChartData = signal<ChartData<LineChartDataset>>({ datasets: [], labels: [] });

  sessionDurationChartData = signal<ChartData<PolarAreaChartDataset>>({ datasets: [], labels: [] });

  /**
   * Rerpresents whether the component is currently in detail view mode.
   * This view is accessible through pagination, allowing the user to see more detailed information.
   */
  isDetailView = signal(false);

  constructor(
    protected trainingPlanService: TrainingPlanService,
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

    effect(
      () => {
        if (this.isLoaded()) {
          this.trainingStatisticService.updateLastViewedCategories(this.trainingPlanId(), this.selectedExercises());

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
    forkJoin({
      allCategories: this.trainingStatisticService.getAllCategories(),
      selectedCategories: this.trainingStatisticService.getSelectedCategories(this.trainingPlanId()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ allCategories, selectedCategories }) => {
        this.allExercises.set(allCategories);
        this.selectedExercises.set(selectedCategories);

        this.isLoaded.set(true);
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
      performance: this.trainingStatisticService.getPerformanceDataForSelectedExercises(id, exercises),
      sessionDurationData: this.trainingStatisticService.getAverageSessionDurationDataForTrainingPlanDay(id),
      title: this.trainingStatisticService.getTrainingPlanTitle(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ tonnage, performance, sessionDurationData, title }) => {
        this.setHeadlineInfo(title);
        this.isLoaded.set(true);

        this.initializeSessionDurationData(sessionDurationData);

        this.initializeLineChartData(tonnage, TrainingDayChartType.VOLUME);
        this.initializeLineChartData(performance, TrainingDayChartType.PERFORMANCE);
      });
  }

  initializeSessionDurationData(sessionDurationData: AverageTrainingDayDurationDto[]): void {
    const labels = sessionDurationData.map((session) => session.dayOfWeek);
    const data = sessionDurationData.map((session) => session.averageDuration);
    const color = sessionDurationData.map(
      (session) => this.chartColorService.getCategoryColor(session.dayOfWeek).backgroundColor,
    );

    const sessionDataset: PolarAreaChartDataset = {
      label: 'Trainingsdauer pro Einheit',
      data: data,
      backgroundColor: color,
    };

    // Set the chart data with the mapped labels and dataset
    this.sessionDurationChartData.set({
      labels: labels,
      datasets: [sessionDataset],
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

  /**
   * Initializes the line chart data with the tonnage data for each category
   * and assigns it to the appropriate chart signal based on the provided chart type.
   *
   * @param tonnageData - An object containing tonnage data for each exercise category.
   * @param chartType - The type of chart to initialize (volume or performance).
   */
  private initializeLineChartData(tonnageData: LineChartDataDTO, chartType: TrainingDayChartType) {
    const lineDatasets = Object.keys(tonnageData).map((categoryKey) => {
      const categoryData = tonnageData[categoryKey];
      return this.createTonnageDataSet(categoryKey, categoryData || []);
    });

    const lineLabels = this.generateWeekLabels(lineDatasets[0]?.data.length || 0);

    if (chartType === TrainingDayChartType.VOLUME) {
      this.volumeChartData.set({ datasets: lineDatasets, labels: lineLabels });
    } else if (chartType === TrainingDayChartType.PERFORMANCE) {
      this.performanceChartData.set({ datasets: lineDatasets, labels: lineLabels });
    }
  }

  /**
   * Creates a dataset for the line chart, representing the tonnage for a specific category.
   *
   * @param category - The name of the exercise category (e.g., 'squat').
   * @param data - An array of tonnage data points.
   * @returns A dataset formatted for the line chart.
   */
  private createTonnageDataSet(category: string, data: number[]): LineChartDataset {
    const colors = this.chartColorService.getCategoryColor(category);
    return {
      label: category,
      data: data,
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      fill: false,
    };
  }

  /**
   * Generates week labels for the charts based on the given number of weeks.
   */
  private generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
  }

  /**
   * Parses the training plan ID from the current URL.
   *
   * @returns The training plan ID extracted from the URL.
   */
  private parseTrainingPlanIdFromUrl(): string {
    return this.router.url.split('/').pop()!;
  }
}
