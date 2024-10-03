import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ChartData } from '../../shared/components/charts/chart-data';
import { LineChartDataset } from '../../shared/components/charts/line-chart/line-chart-data-set';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { FloatingLabelInputItem } from '../../shared/components/floating-label-input/floating-label-input-item';
import { FloatingLabelInputComponent } from '../../shared/components/floating-label-input/floating-label-input.component';
import { IconBackgroundColor } from '../../shared/components/icon-list-item/icon-background-color';
import { IconListeItemComponent } from '../../shared/components/icon-list-item/icon-list-item.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { IconName } from '../../shared/icon/icon-name';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { NotificationService } from '../../shared/service/notification.service';
import { HeaderService } from '../header/header.service';
import { ChartDataDto } from '../training-plans/training-day-statistics/chart-data-dto';
import { TrainingDayChartType } from '../training-plans/training-day-statistics/training-day-chart-type';
import { TrainingStatisticsService } from '../training-plans/training-day-statistics/training-statistics.service';
import { ChartColorService } from '../training-plans/training-view/services/chart-color.service';
import { StatisticsService } from './statistics.service';
import { TrainingDayNotificationComponent } from './training-day-notification/training-day-notification.component';
import { TrainingStatisticsDataView } from './training-statistics-data-view';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    TrainingDayNotificationComponent,
    LineChartComponent,
    SelectComponent,
    FloatingLabelInputComponent,
    IconListeItemComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  providers: [ImageDownloadService, StatisticsService, TrainingStatisticsService],
})
export class StatisticsComponent implements OnInit {
  protected readonly TrainingStatisticsDataView = TrainingStatisticsDataView;
  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;
  selectedTrainingPlans = signal<string[]>([]);

  trainingPlanTitles = signal<string[]>([]);

  trainingStatisticsDataViewOptions = signal<FloatingLabelInputItem[]>([]);

  selectedDataViewOption = signal(TrainingStatisticsDataView.VOLUME);

  /**
   * Holds the list of all available exercises.
   */
  allCategories: WritableSignal<FloatingLabelInputItem[]> = signal([]);

  selectedCategory = signal('');

  /**
   * Holds the data for the volume progression throughout the weeks.
   */
  volumeChartData = signal<ChartData<LineChartDataset>>({ datasets: [], labels: [] });

  /**
   * Holds the data for the performance develeopment based on the 1RM.
   */
  performanceChartData = signal<ChartData<LineChartDataset>>({ datasets: [], labels: [] });

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private statisticsService: StatisticsService,
    private trainingStatisticService: TrainingStatisticsService,
    private destroyRef: DestroyRef,
    private chartColorService: ChartColorService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Usage',
    });

    this.fetchAndSetCategoryMetadata();
    this.initializeTrainingPlanSelection();
    this.initializeDataViewOptions();

    this.handleConfigurationParamUpdate();
  }

  private handleConfigurationParamUpdate() {
    effect(
      () => {
        const trainingPlans = this.selectedTrainingPlans();
        const category = this.selectedCategory();
        const selectedDataViewOption = this.selectedDataViewOption();

        if (trainingPlans.length === 0 || !category) {
          return;
        }

        if (selectedDataViewOption === TrainingStatisticsDataView.VOLUME) {
          return this.statisticsService
            .getVolumeChartComparisonData(category, trainingPlans)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              this.updateChartData(data, TrainingDayChartType.VOLUME);
            });
        }
        return this.statisticsService
          .getPerformanceChartComparisonData(category, trainingPlans)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((data) => {
            this.updateChartData(data, TrainingDayChartType.PERFORMANCE);
          });
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  private updateChartData(tonnageData: Record<string, ChartDataDto>, chartType: TrainingDayChartType): void {
    const lineDatasets: LineChartDataset[] = [];

    Object.keys(tonnageData).forEach((planTitle) => {
      const planData = tonnageData[planTitle];

      Object.keys(planData).forEach((categoryKey) => {
        const categoryData = planData[categoryKey];

        lineDatasets.push(this.createTonnageDataSet(`${planTitle.toUpperCase()}`, categoryData || []));
      });
    });

    // Generate labels for the chart (assumes weekly data)
    const lineLabels = this.generateWeekLabels(lineDatasets[0]?.data.length || 0);

    // Set the appropriate chart based on the chartType
    if (chartType === TrainingDayChartType.VOLUME) {
      this.volumeChartData.set({ datasets: lineDatasets, labels: lineLabels });
    } else if (chartType === TrainingDayChartType.PERFORMANCE) {
      this.performanceChartData.set({ datasets: lineDatasets, labels: lineLabels });
    }
  }

  /**
   * Generates week labels for the charts based on the given number of weeks.
   */
  private generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Woche ${index + 1}`);
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
      fill: true,
    };
  }

  /**
   * Fetches category metadata including all categories and selected categories for a given ID,
   * then updates the component's state and fetches additional statistics.
   */
  private fetchAndSetCategoryMetadata(): void {
    forkJoin({
      allCategories: this.trainingStatisticService.getAllCategories(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ allCategories }) => {
        const mappedCategories = this.mapToFloatingLabelInputItem(allCategories);
        this.allCategories.set(mappedCategories);
        this.selectedCategory.set(allCategories[0]);
      });
  }

  private initializeDataViewOptions(): void {
    const mappedDataViewOptions = this.mapToFloatingLabelInputItem(Object.values(TrainingStatisticsDataView));
    this.trainingStatisticsDataViewOptions.set(mappedDataViewOptions);
  }

  private initializeTrainingPlanSelection(): void {
    this.statisticsService.getAllTrainingPlanTitles().subscribe((titles) => {
      this.trainingPlanTitles.set(titles);

      this.selectedTrainingPlans.set(titles);
    });
  }

  mapToFloatingLabelInputItem(items: string[]): FloatingLabelInputItem[] {
    return items.map((item) => ({
      label: item,
      value: item,
    }));
  }
}
