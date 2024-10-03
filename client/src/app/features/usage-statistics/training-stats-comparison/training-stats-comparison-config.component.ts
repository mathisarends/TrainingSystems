import { Component, WritableSignal } from '@angular/core';
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
  /**
   * Holds the selected training plans.
   */
  selectedTrainingPlans!: WritableSignal<string[]>;

  /**
   * Stores available training plan titles.
   */
  trainingPlanTitles!: WritableSignal<string[]>;

  /**
   * Contains the available data view options for statistics configuration.
   */
  trainingStatisticsDataViewOptions!: WritableSignal<FloatingLabelInputItem[]>;

  /**
   * Stores the selected data view option, defaulting to volume.
   */
  selectedDataViewOption!: WritableSignal<TrainingStatisticsDataView>;

  /**
   * Holds all available categories for training statistics filtering.
   */
  allCategories!: WritableSignal<FloatingLabelInputItem[]>;

  /**
   * Stores the currently selected category.
   */
  selectedCategory!: WritableSignal<string>;
}
