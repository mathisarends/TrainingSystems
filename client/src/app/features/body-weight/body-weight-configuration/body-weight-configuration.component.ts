import { ChangeDetectionStrategy, Component, computed, effect, OnInit, signal } from '@angular/core';
import { BodyWeightGoal } from '../body-weight-goal.enum';
import { BodyWeightService } from '../body-weight.service';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownStringOptionsPipe } from '../../../shared/components/floating-label-input/to-dropdown-options-from-strings.pipe';
import { BodyWeightConfigurationService } from './body-weight-configuration.service';

@Component({
  selector: 'app-body-weight-configuration',
  standalone: true,
  imports: [FloatingLabelInputComponent, ToDropDownStringOptionsPipe],
  templateUrl: './body-weight-configuration.component.html',
  styleUrls: ['./body-weight-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightConfigurationComponent implements OnInit {
  protected readonly BodyWeightGoal = BodyWeightGoal;
  /**
   * Holds the available goals for body weight, based on the BodyWeightGoal enum values.
   */
  bodyWeightGoalOptions = signal(Object.keys(BodyWeightGoal));

  /**
   * Computes the label for the rate based on the selected body weight goal.
   */
  rateLabel = computed(() =>
    this.bodyWeightConfigurationService.bodyWeightGoal() === BodyWeightGoal.GAIN ? 'Gain-Rate' : 'Lose-Rate',
  );

  /**
   * Contains the available options for the body weight change rate.
   */
  bodyWeightRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5];

  constructor(
    protected bodyWeightService: BodyWeightService,
    protected bodyWeightConfigurationService: BodyWeightConfigurationService,
  ) {
    effect(
      () => {
        if (this.bodyWeightConfigurationService.bodyWeightGoal() === BodyWeightGoal.MAINTAIN) {
          this.bodyWeightConfigurationService.bodyWeightRate.set(0);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.bodyWeightService.loadBodyWeightConfiguration().subscribe((bodyWeightConfiguration) => {
      console.log('bodyWeightConfiguration', bodyWeightConfiguration);
      this.bodyWeightConfigurationService.bodyWeightGoal.set(bodyWeightConfiguration.weightGoal);
      this.bodyWeightConfigurationService.bodyWeightRate.set(bodyWeightConfiguration.weightGoalRate);
    });
  }
}
