import { Component, computed, WritableSignal } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { FloatingLabelInputItem } from '../../../shared/components/floating-label-input/floating-label-input-item';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { TrainingStatisticsDataView } from '../training-statistics-data-view';

@Component({
  standalone: true,
  imports: [FloatingLabelInputComponent, SelectComponent, AlertComponent],
  selector: 'app-training-stats-comparison-config',
  templateUrl: './training-stats-comparison-config.component.html',
  styleUrls: ['./training-stats-comparison-config.component.scss'],
})
export class TrainingStatsComparisonConfigComponent {
  selectedTrainingPlans!: WritableSignal<string[]>;
  trainingPlanTitles!: WritableSignal<string[]>;
  trainingStatisticsDataViewOptions!: WritableSignal<FloatingLabelInputItem[]>;
  selectedDataViewOption!: WritableSignal<TrainingStatisticsDataView>;
  allCategories!: WritableSignal<FloatingLabelInputItem[]>;
  selectedCategory!: WritableSignal<string>;

  isInitialized = computed(
    () =>
      this.selectedTrainingPlans() &&
      this.trainingPlanTitles() &&
      this.trainingStatisticsDataViewOptions() &&
      this.selectedDataViewOption() &&
      this.allCategories() &&
      this.selectedCategory(),
  );
}
