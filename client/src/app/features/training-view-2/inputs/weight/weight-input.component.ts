import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractInputHandler } from '../abstract-input-handler';

@Component({
  selector: 'app-weight-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './weight-input.component.html',
  styleUrls: ['./weight-input.component.component.scss'],
})
export class WeightInputComponent extends AbstractInputHandler {
  /**
   * Weight input value as a signal.
   */
  weight = model<string | undefined>(undefined);

  /**
   * Number of sets required for the input.
   */
  numberOfSets = input<number>(3);

  /**
   * Emits the weight change.
   */
  weightChanged = output<string>();

  protected handleDoubleClick(): void {
    const weightArray = this.parseInputValues(this.weight() ?? '');
    if (weightArray.length === 0) {
      return;
    }

    if (weightArray.length < this.numberOfSets()) {
      const updatedWeights = this.duplicateLastValue(weightArray, this.numberOfSets());
      this.weight.set(updatedWeights.join(this.delimiter));

      if (updatedWeights.length === this.numberOfSets()) {
        const weightArray = this.parseInputValues(this.weight() ?? '');
        const averageWeight = this.calculateRoundedAverage(weightArray, 2.5).toString();
        this.weight.set(averageWeight);
      }
    }
  }

  protected onWeightChanged(event: Event): void {
    const newWeight = (event.target as HTMLInputElement).value;

    const validatedWeight = this.validateInput(newWeight);
    this.weight.set(validatedWeight);

    const weightArray = this.parseInputValues(validatedWeight);
    if (weightArray.length === this.numberOfSets()) {
      const averageWeight = this.calculateRoundedAverage(weightArray, 2.5).toString();
      this.weight.set(averageWeight);
    }
  }
}
