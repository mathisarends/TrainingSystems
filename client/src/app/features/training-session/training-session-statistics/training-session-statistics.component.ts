import { Component, DestroyRef, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { forkJoin } from 'rxjs';
import { ChartData } from '../../../shared/components/charts/chart-data';
import { LineChartDataset } from '../../../shared/components/charts/line-chart/line-chart-data-set';
import { LineChartComponent } from '../../../shared/components/charts/line-chart/line-chart.component';
import { ChartSkeletonComponent } from '../../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { ImageDownloadService } from '../../../shared/service/image-download.service';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
import { TrainingDayChartType } from '../../training-plans/training-plan-statistics/training-day-chart-type';
import { ChartColorService } from '../../training-plans/training-view/services/chart-color.service';
import { TrainingSessionStatisticsService } from './training-session-statistics.service';

@Component({
  standalone: true,
  imports: [LineChartComponent, ChartSkeletonComponent],
  selector: 'selector-name',
  templateUrl: 'training-session-statistics.component.html',
  styleUrls: ['./training-session-statistics.component.scss'],
  providers: [TrainingSessionStatisticsService, ImageDownloadService],
})
export class TrainingSesssionStatisticsComponent implements OnInit, SetHeadlineInfo {
  /**
   * The current training plan ID.
   */
  trainingSessionId = signal('');

  exercises: WritableSignal<string[]> = signal([]);

  /**
   * Holds the data for the volume progression throughout the weeks.
   */
  tonnageChartData = signal<ChartData<LineChartDataset>>({ datasets: [], labels: [] });

  /**
   * Holds the data for the performance develeopment based on the 1RM.
   */
  performanceChartData = signal<ChartData<LineChartDataset>>({ datasets: [], labels: [] });

  /**
   * Indicates whether the data has been fully loaded.
   */
  isLoaded = signal(false);

  constructor(
    private headerService: HeaderService,
    private trainingSessionStatisticsService: TrainingSessionStatisticsService,
    private router: Router,
    private injector: Injector,
    private destroyRef: DestroyRef,
    private chartColorService: ChartColorService,
  ) {}

  ngOnInit() {
    this.headerService.setLoading();

    this.trainingSessionId.set(this.trainingSessionUrlFromUrl());

    this.fetchTitleAndExercises(this.trainingSessionId());

    effect(
      () => {
        if (this.isLoaded()) {
          this.fetchChartData(this.trainingSessionId(), this.exercises());
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Sets the headline information for the page.
   * Updates the header with the given title and a fixed subtitle ('stats').
   *
   * @param title - The main title to display in the header.
   */
  setHeadlineInfo(title: string): void {
    this.headerService.setHeadlineInfo({
      title: title,
      subTitle: 'stats',
    });
  }

  private fetchTitleAndExercises(id: string): void {
    forkJoin({
      title: this.trainingSessionStatisticsService.getTrainingSessiontitleById(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ title }) => {
        this.setHeadlineInfo(title);
        this.isLoaded.set(true);
      });
  }

  private fetchChartData(id: string, exercises: string[]) {
    forkJoin({
      tonnageChartData: this.trainingSessionStatisticsService.getTonnageChartData(id, exercises),
      performanceChartData: this.trainingSessionStatisticsService.getPerformanceChartData(id, exercises),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ tonnageChartData, performanceChartData }) => {
        this.initializeLineChartData(tonnageChartData, TrainingDayChartType.VOLUME);
        this.initializeLineChartData(performanceChartData, TrainingDayChartType.PERFORMANCE);
      });
  }

  private initializeLineChartData(tonnageData: ChartDataDto, chartType: TrainingDayChartType) {
    const lineDatasets = Object.keys(tonnageData).map((categoryKey) => {
      const categoryData = tonnageData[categoryKey];
      return this.createTonnageDataSet(categoryKey, categoryData || []);
    });

    const lineLabels = this.generateWeekLabels(lineDatasets[0]?.data.length || 0);

    if (chartType === TrainingDayChartType.VOLUME) {
      this.tonnageChartData.set({ datasets: lineDatasets, labels: lineLabels });
    } else if (chartType === TrainingDayChartType.PERFORMANCE) {
      this.performanceChartData.set({ datasets: lineDatasets, labels: lineLabels });
    }
  }

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
   * Generates week labels for the charts based on the given number of weeks.
   */
  private generateWeekLabels(length: number): string[] {
    return Array.from({ length }, (_, index) => `Session ${index + 1}`);
  }

  /**
   * Parses the training plan ID from the current URL.
   *
   * @returns The training plan ID extracted from the URL.
   */
  private trainingSessionUrlFromUrl(): string {
    return this.router.url.split('/').pop()!;
  }
}
