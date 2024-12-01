import { Component, effect, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weight-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './weight-input.component.html',
  styleUrls: ['./weight-input.component.component.scss'],
})
export class WeightInputComponent {
  /**
   * Holds the current weight value as a space-separated string of numbers.
   */
  weight = model<string | undefined>(undefined);

  /**
   * Number of sets for the exercise.
   */
  numberOfSets = input.required<number>();

  /**
   * Emits the updated weight when it changes.
   */
  weightChanged = output<string>();

  /**
   * Delimiter used to split weight values.
   */
  protected readonly delimiter: string = ' ';

  constructor() {
    // Automatically emit changes to the `weightChanged` output when `weight` updates
    effect(() => {
      const weight = this.weight();
      if (weight) {
        this.weightChanged.emit(weight);
      }
    });
  }

  /**
   * Handles weight input changes and ensures the weight string is valid.
   */
  protected onWeightChanged(event: Event): void {
    const newWeight = (event.target as HTMLInputElement).value;
    const validatedWeight = this.validateWeightInput(newWeight);
    this.weight.set(validatedWeight);

    const weightArray = this.parseWeightValues();
    if (weightArray.length === this.numberOfSets()) {
      const averageWeight = this.getRoundedAverage(weightArray, 2.5).toString();
      this.weight.set(averageWeight);
    }
  }

  /**
   * Handles double-click events to duplicate the last weight or calculate the average.
   */
  protected onDoubleClick(): void {
    const weightArray = this.parseWeightValues();

    if (weightArray.length === 0) {
      this.weight.set('');
    } else if (weightArray.length + 1 < this.numberOfSets()) {
      const lastValue = weightArray[weightArray.length - 1];
      this.weight.set([...weightArray, lastValue].join(this.delimiter));
    } else {
      const averageWeight = this.getRoundedAverage(weightArray, 2.5);
      this.weight.set(averageWeight.toString());
    }
  }

  /**
   * Validates and sanitizes the weight input string.
   */
  private validateWeightInput(input: string): string {
    return input
      .split(this.delimiter)
      .map((value) => value.trim().replace(',', '.'))
      .filter((value) => !isNaN(parseFloat(value)))
      .join(this.delimiter);
  }

  /**
   * Parses the weight string into an array of numeric values.
   */
  private parseWeightValues(): number[] {
    const weight = this.weight() ?? '';
    return weight
      .split(this.delimiter)
      .map((value) => parseFloat(value.trim().replace(',', '.')))
      .filter((value) => !isNaN(value));
  }

  /**
   * Calculates the rounded average of the weight values with a given step.
   */
  private getRoundedAverage(values: number[], step: number): number {
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = sum / values.length;
    return Math.round(average / step) * step;
  }
}
