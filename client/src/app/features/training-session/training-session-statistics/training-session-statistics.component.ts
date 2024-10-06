import { Component, DestroyRef, effect, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HeaderService } from '../../header/header.service';
import { TrainingStatisticsService } from '../../training-plans/training-plan-statistics/training-statistics.service';

@Component({
  standalone: true,
  imports: [],
  selector: 'selector-name',
  templateUrl: 'training-session-statistics.component.html',
  styleUrls: ['./training-session-statistics.component.scss'],
  providers: [TrainingStatisticsService],
})
export class TrainingSesssionStatisticsComponent implements OnInit {
  /**
   * The current training plan ID.
   */
  trainingSessionId = signal('');

  /**
   * Indicates whether the data has been fully loaded.
   */
  isLoaded = signal(false);

  constructor(
    private headerService: HeaderService,
    private trainingStatisticService: TrainingStatisticsService,
    private router: Router,
    private injector: Injector,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.headerService.setLoading();

    this.trainingSessionId.set(this.trainingSessionUrlFromUrl());

    effect(
      () => {
        if (this.isLoaded()) {
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  fetchAndSetCategoryMetadata(): void {
    forkJoin({
      /* title: this.trainingStatisticService.getTrainingPlanTitle(this.trainingSessionId()), */
    }).pipe(takeUntilDestroyed(this.destroyRef));
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
