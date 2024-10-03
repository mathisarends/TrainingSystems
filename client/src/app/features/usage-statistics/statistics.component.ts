import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { FloatingLabelInputItem } from '../../shared/components/floating-label-input/floating-label-input-item';
import { FloatingLabelInputComponent } from '../../shared/components/floating-label-input/floating-label-input.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { ImageDownloadService } from '../../shared/service/image-download.service';
import { NotificationService } from '../../shared/service/notification.service';
import { HeaderService } from '../header/header.service';
import { TrainingStatisticsService } from '../training-plans/training-day-statistics/training-statistics.service';
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
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  providers: [ImageDownloadService, StatisticsService, TrainingStatisticsService],
})
export class StatisticsComponent implements OnInit {
  selectedTrainingPlan = signal<string>('');

  trainingPlanTitles = signal<FloatingLabelInputItem[]>([]);

  trainingStatisticsDataViewOptions = signal<FloatingLabelInputItem[]>([]);

  selectedDataViewOption = signal(TrainingStatisticsDataView.VOLUME);

  /**
   * Holds the list of all available exercises.
   */
  allCategories: WritableSignal<FloatingLabelInputItem[]> = signal([]);

  selectedCategory = signal('');

  constructor(
    protected notificationService: NotificationService,
    private headerService: HeaderService,
    private statisticsService: StatisticsService,
    private trainingStatisticService: TrainingStatisticsService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.headerService.setHeadlineInfo({
      title: 'Usage',
    });

    this.fetchAndSetCategoryMetadata();
    this.initializeTrainingPlanSelection();
    this.initializeDataViewOptions();
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
        const mappedCategories = this.mapToFloatingLabelInputItem(allCategories)
        this.allCategories.set(mappedCategories);
        this.selectedCategory.set(allCategories[0]);
      });
  }

  private initializeDataViewOptions(): void {
    const mappedDataViewOptions = this.mapToFloatingLabelInputItem(Object.values(TrainingStatisticsDataView));
    this.trainingStatisticsDataViewOptions.set(mappedDataViewOptions);
  }

  private initializeTrainingPlanSelection(): void {
    this.statisticsService.getIdTitleMappingsForTrainingPlans().subscribe((titles) => {
      const mappedTitles = this.mapToFloatingLabelInputItem(titles);
      this.trainingPlanTitles.set(mappedTitles);

      this.selectedTrainingPlan.set(titles[0]);
    });
  }

  mapToFloatingLabelInputItem(items: string[]): FloatingLabelInputItem[] {
    return items.map((item) => ({
      label: item,
      value: item,
    }));
  }
}
