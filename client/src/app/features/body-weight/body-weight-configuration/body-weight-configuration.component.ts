import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BodyWeightGoal } from '../body-weight-goal.enum';
import { BodyWeightService } from '../body-weight.service';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownStringOptionsPipe } from '../../../shared/components/floating-label-input/to-dropdown-options-from-strings.pipe';

@Component({
  selector: 'app-body-weight-configuration',
  standalone: true,
  imports: [FloatingLabelInputComponent, ToDropDownStringOptionsPipe],
  templateUrl: './body-weight-configuration.component.html',
  styleUrls: ['./body-weight-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightConfigurationComponent {
  /**
   * Holds the available goals for body weight, based on the BodyWeightGoal enum values.
   */
  bodyWeightGoalOptions = signal(Object.keys(BodyWeightGoal));

  /**
   * Stores the currently selected body weight goal (gain or lose).
   */
  bodyWeightGoal = signal(BodyWeightGoal.GAIN);

  /**
   * Computes the label for the rate based on the selected body weight goal.
   */
  rateLabel = computed(() => (this.bodyWeightGoal() === BodyWeightGoal.GAIN ? 'Gain-Rate' : 'Lose-Rate'));

  /**
   * Stores the currently selected body weight change rate.
   */
  bodyWeightRate = signal(0.25);

  /**
   * Contains the available options for the body weight change rate.
   */
  bodyWeightRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5];

  constructor(private bodyWeightService: BodyWeightService) {}
}
