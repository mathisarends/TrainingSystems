import { Directive, HostListener, Input } from '@angular/core';
import { InteractiveElementService } from '../service/util/interactive-element.service';
import { FormService } from '../service/form/form.service';
import { ExerciseTableRowService } from '../service/training/exercise-table-row.service';

/**
 * Directive that extends the InteractiveElementDirective to add additional functionality.
 */
@Directive({
  selector: '[weightInput]',
  standalone: true,
})
export class WeightInputDirective {
  @Input() weightInput!: string;

  constructor(
    private interactiveElementService: InteractiveElementService,
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
  ) {}

  /**
   * Handles the focus event of the interactive element.
   * When the element gains focus, its value is stored by the InteractiveElementService.
   *
   * @param target - The HTML element that triggered the focus event.
   */
  @HostListener('focus', ['$event.target'])
  handleFocusEvent(weightInput: HTMLInputElement): void {
    this.interactiveElementService.focus(weightInput.value);
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   *
   * @param target - The HTML element that triggered the blur event.
   */
  @HostListener('blur', ['$event.target'])
  handleBlurEvent(weightInput: HTMLInputElement): void {
    const weightValues = this.parseWeightInputValues(weightInput);
    const amountOfSets = Number(this.exerciseTableRowService.getSetInputByElement(weightInput).value);

    if (weightValues.length === amountOfSets) {
      const roundedWeight = this.calculateRoundedWeight(weightValues);
      weightInput.value = roundedWeight.toString();
    }

    this.formService.addChange(weightInput.name, weightInput.value);

    this.interactiveElementService.triggerChangeIfModified(weightInput.value);
  }

  /**
   * Handles the input event of the interactive element.
   * When the value of the element changes, the new value is tracked by the FormService.
   *
   * @param event - The input event triggered by the element.
   */
  @HostListener('input', ['$event'])
  handleInputChange(event: Event): void {
    this.formService.trackChange(event);
  }

  /**
   * Calculates the rounded average weight from the given weight values.
   *
   * @param {number[]} weightValues The array of weight values.
   * @returns {number} The rounded average weight.
   */
  private calculateRoundedWeight(weightValues: number[]): number {
    const averageWeight = weightValues.reduce((acc, curr) => acc + curr, 0) / weightValues.length;
    return Math.round(averageWeight / 2.5) * 2.5;
  }

  /**
   * Parses the weight input field values into an array of numbers,
   * converting commas to dots before parsing to ensure valid float conversion.
   *
   * @param {HTMLInputElement} weightInput The weight input field.
   * @returns {number[]} The parsed weight values.
   */
  private parseWeightInputValues(weightInput: HTMLInputElement): number[] {
    return weightInput.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }
}
