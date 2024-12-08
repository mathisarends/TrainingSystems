import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractDoubleClickHandler } from '../abstract-double-click-handler';

@Component({
  selector: 'app-weight-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './weight-input.component.html',
})
export class WeightInputComponent extends AbstractDoubleClickHandler {
  /**
   * Weight input value as a signal.
   */
  weight = model<string | undefined>(undefined);

  /**
   * Number of sets required for the input.
   */
  numberOfSets = input.required<number>();

  /**
   * Weight recommendation that is shown when no value is given.
   */
  weightRecommendation = input('');

  /**
   * Emits the weight change.
   */
  weightChanged = output<string>();

  /**
   * Stores the previous weight to compare changes.
   */
  private previousWeight: string | undefined;

  /**
   * Tracks whether the component has been fully initialized.
   */
  private isInitialized = false;

  constructor(protected override elementRef: ElementRef) {
    super(elementRef);

    effect(() => {
      if (!this.isInitialized) {
        this.previousWeight = this.weight();
        this.isInitialized = true;
      }
    });

    // Prevents change emits on update
    effect(() => {
      const currentWeight = this.weight();

      if (this.isInitialized && this.focused() && currentWeight !== this.previousWeight) {
        this.previousWeight = currentWeight;
        if (currentWeight) {
          this.weightChanged.emit(currentWeight);
        }
      }
    });
  }

  /**
   * Handles a double-click event on the input. Updates the weight value based on placeholder or duplicates last value if needed.
   */
  protected handleDoubleClick(): void {
    if (!this.weight() && this.weightRecommendation()) {
      this.weight.set(this.weightRecommendation());
      return;
    }

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

  /**
   * Handles changes to the weight input value. Validates and updates the weight and calculates average if necessary.
   */
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
