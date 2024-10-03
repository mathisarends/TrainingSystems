import { Component, signal } from '@angular/core';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownOptionsPipe } from '../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { TrainingStatisticsDataView } from '../training-statistics-data-view';

@Component({
  standalone: true,
  imports: [FloatingLabelInputComponent, ToDropDownOptionsPipe],
  selector: 'app-training-plan-comparison-config',
  templateUrl: 'training-plan-comparison-config.component.html',
  styleUrls: ['./training-plan-comparison-config.component.scss'],
})
export class TrainingPlanComparisonConfigComponent {
  trainingPlanTitles = signal<>([]);

  selectedTrainingPlans = signal<string[]>([]);

  trainingStatisticsDataViewOptions = signal(Object.values(TrainingStatisticsDataView));

  selectedDataViewOption = signal([TrainingStatisticsDataView.VOLUME]);

  /* effect(() => {

    }) */
}
