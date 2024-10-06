import { Component, DestroyRef, effect, Injector, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ChartData } from '../../../shared/components/charts/chart-data';
import { LineChartDataset } from '../../../shared/components/charts/line-chart/line-chart-data-set';
import { HeaderService } from '../../header/header.service';
import { TrainingSessionStatisticsService } from './training-session-statistics.service';

@Component({
  standalone: true,
  imports: [],
  selector: 'selector-name',
  templateUrl: 'training-session-statistics.component.html',
  styleUrls: ['./training-session-statistics.component.scss'],
  providers: [TrainingSessionStatisticsService],
})
export class TrainingSesssionStatisticsComponent implements OnInit {
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
  ) {}

  ngOnInit() {
    this.headerService.setLoading();

    this.trainingSessionId.set(this.trainingSessionUrlFromUrl());

    this.fetchAndSetCategoryMetadata(this.trainingSessionId());

    effect(
      () => {
        if (this.isLoaded()) {
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  fetchAndSetCategoryMetadata(id: string): void {
    forkJoin({
      title: this.trainingSessionStatisticsService.getTrainingSessiontitleById(id),
      exerciseOptions: this.trainingSessionStatisticsService.getExerciseOptions(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ title, exerciseOptions }) => {
        this.setHeadlineInfo(title);
        this.exercises.set(exerciseOptions);

        // TODO: Das hier mappen
        /* this.tonnageChartData.set(tonnageChartData);
        this.performanceChartData.set(performanceChartData); */
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
   * Parses the training plan ID from the current URL.
   *
   * @returns The training plan ID extracted from the URL.
   */
  private trainingSessionUrlFromUrl(): string {
    return this.router.url.split('/').pop()!;
  }
}
