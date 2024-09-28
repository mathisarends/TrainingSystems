import { Component, DestroyRef, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BarChartData } from '../../../shared/components/charts/grouped-bar-chart/bar-chart-data';
import { GroupedBarChartComponent } from '../../../shared/components/charts/grouped-bar-chart/grouped-bar-chart.component';
import { LineChartDataset } from '../../../shared/components/charts/line-chart/lilne-chart-data-set';
import { LineChartData } from '../../../shared/components/charts/line-chart/line-chart-data';
import { LineChartComponent } from '../../../shared/components/charts/line-chart/line-chart.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { HeadlineComponent } from '../../../shared/components/headline/headline.component';
import { ChartSkeletonComponent } from '../../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { ToSelectItemPipe } from '../../../shared/components/select/to-select-item.pipe';
import { SingleSelectComponent } from '../../../shared/components/single-select/single-select.component';
import { KeyboardService } from '../../../shared/service/keyboard.service';
import { HeaderService } from '../../header/header.service';
import { ChangeProfilePictureConfirmationComponent } from '../../profile-2/change-profile-picture-confirmation/change-profile-picture-confirmation.component';
import { ChartColorService } from '../training-view/services/chart-color.service';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
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
    SelectComponent,
    DropdownComponent,
    LineChartComponent,
    GroupedBarChartComponent,
    HeadlineComponent,
    ChartSkeletonComponent,
    ChangeProfilePictureConfirmationComponent,
    PaginationComponent,
    SingleSelectComponent,
    ToSelectItemPipe,
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

  /**
   * Rerpresents whether the component is currently in detail view mode.
   * This view is accessible through pagination, allowing the user to see more detailed information.
   */
  isDetailView = signal(false);

  /**
   * Rerpresents the currently selected category in the single select dropdown.
   * This value is used in the detail view to display detailed information for the selected category.
   */
  singleCategorySelectionValue = signal('');

  trainingPlanTitles = signal<string[]>([]);

  selectedTrainingPlanTitle = signal<string>('');

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

    this.setupSelectedCategorySaveOnNavigationSync();

    this.initalizeTrainingPlanComparisonOptions();

    effect(
      () => {
        if (this.isLoaded()) {
          this.fetchStatistics(this.trainingPlanId(), this.selectedExercises());
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  private initalizeTrainingPlanComparisonOptions() {
    this.trainingPlanService.loadAndCacheTrainingPlans().subscribe((trainingPlans) => {
      const trainingPlanTitles = trainingPlans.map((trainingPlan) => trainingPlan.title);
      this.trainingPlanTitles.set(trainingPlanTitles);

      if (trainingPlanTitles.length > 0) {
        this.selectedTrainingPlanTitle.set(trainingPlanTitles[0]);
      }
    });
  }

  protected onPageChanged(page: number) {
    if (page === 0) {
      this.isDetailView.set(false);
    } else {
      this.isDetailView.set(true);
    }
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

        this.singleCategorySelectionValue.set(selectedCategories[0]);
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
      sets: this.trainingStatisticService.getSetDataForSelectedExercises(id, exercises),
      title: this.trainingStatisticService.getTrainingPlanTitle(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ tonnage, sets, title }) => {
        this.isLoaded.set(true);
        this.setHeadlineInfo(title);

        this.initializeTonnageChartData(tonnage);
        this.initializeSetsBarChartData(sets);
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
   * Initializes the grouped bar chart data with the sets response data.
   *
   * @param setsResponse - An object where each key represents a category,
   *                       and the value is an array of numbers representing sets per week.
   */
  private initializeSetsBarChartData(setsResponse: { [key: string]: number[] }): void {
    const barDatasets = Object.keys(setsResponse).map((categoryKey) => {
      const setsData = setsResponse[categoryKey];
      return this.createBarDataset(categoryKey, setsData || []);
    });

    const weekLabels = this.generateWeekLabels(barDatasets[0].data.length || 0);

    this.groupedBarChartData.set({ datasets: barDatasets, labels: weekLabels });
  }

  /**
   * Initializes the line chart data with the tonnage data for each category.
   *
   * @param tonnageData - An object containing tonnage data for each exercise category.
   */
  private initializeTonnageChartData(tonnageData: TrainingExerciseTonnageDto) {
    const lineDatasets = Object.keys(tonnageData).map((categoryKey) => {
      const categoryData = tonnageData[categoryKey as keyof TrainingExerciseTonnageDto];
      return this.createTonnageDataSet(categoryKey, categoryData || []);
    });

    const lineLabels = this.generateWeekLabels(lineDatasets[0]?.data.length || 0);
    this.lineChartData.set({ datasets: lineDatasets, labels: lineLabels });
  }

  /**
   * Creates a dataset for the line chart, representing the tonnage for a specific category.
   *
   * @param category - The name of the exercise category (e.g., 'squat').
   * @param data - An array of tonnage data points.
   * @returns A dataset formatted for the line chart.
   */
  private createTonnageDataSet(category: string, data: Tonnage[]): LineChartDataset {
    const colors = this.chartColorService.getCategoryColor(category);
    return {
      label: category,
      data: this.extractTonnageData(data),
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      fill: false,
    };
  }

  /**
   * Creates a dataset for the bar chart, representing the sets for a specific category.
   *
   * @param category - The name of the exercise category (e.g., 'squat').
   * @param data - An array of set counts per week.
   * @returns A dataset formatted for the bar chart.
   */
  private createBarDataset(category: string, data: number[]): any {
    const colors = this.chartColorService.getCategoryColor(category);
    return {
      label: category,
      data: data,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: 1,
    };
  }

  /**
   * Extracts the tonnage data from an array of Tonnage objects.
   */
  private extractTonnageData(data: Tonnage[]): number[] {
    return data.map((week) => week.tonnageInCategory);
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
