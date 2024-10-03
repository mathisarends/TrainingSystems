import { Component, effect, Injector, signal, WritableSignal } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { FloatingLabelInputItem } from '../../../shared/components/floating-label-input/floating-label-input-item';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { StatisticsService } from '../statistics.service';
import { TrainingStatisticsDataView } from '../training-statistics-data-view';

@Component({
  standalone: true,
  imports: [FloatingLabelInputComponent, SelectComponent, AlertComponent],
  selector: 'app-training-stats-comparison-config',
  templateUrl: './training-stats-comparison-config.component.html',
  styleUrls: ['./training-stats-comparison-config.component.scss'],
})
export class TrainingStatsComparisonConfigComponent {
  selectedTrainingPlans = signal<string[]>([]);

  trainingPlanTitles = signal<string[]>([]);

  trainingStatisticsDataViewOptions = signal<FloatingLabelInputItem[]>([]);

  selectedDataViewOption = signal(TrainingStatisticsDataView.VOLUME);

  allCategories: WritableSignal<FloatingLabelInputItem[]> = signal([]);

  selectedCategory = signal('');

  constructor(
    private statisticsService: StatisticsService,
    private injector: Injector,
  ) {
    effect(
      () => {
        this.statisticsService.updateTrainingPlans(this.selectedTrainingPlans());
        console.log('here');
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }
}
