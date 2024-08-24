import { Directive, HostListener, Input } from '@angular/core';
import { InteractiveElementService } from '../service/util/interactive-element.service';
import { FormService } from '../service/form/form.service';
import { ExerciseTableRowService } from '../service/training/exercise-table-row.service';

/**
 * Directive that extends the InteractiveElementDirective to add additional functionality.
 */
@Directive({
  selector: '[actualRpeInput]',
  standalone: true,
})
export class ActualRpeInputDirective {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;

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
  handleFocusEvent(rpeInput: HTMLInputElement): void {
    this.interactiveElementService.focus(rpeInput.value);
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   *
   * @param target - The HTML element that triggered the blur event.
   */
  @HostListener('blur', ['$event.target'])
  handleBlurEvent(rpeInput: HTMLInputElement): void {
    const rpeValues = this.parseRPEInput(rpeInput.value);

    if (rpeValues.length === 1) {
      this.validateSingleRPE(rpeValues[0], rpeInput);
    } else {
      this.validateMultipleRPEs(rpeInput, rpeValues);
    }

    this.interactiveElementService.triggerChangeIfModified(rpeInput.value);
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
   * Parses the RPE input string and returns an array of numbers.
   * Replaces commas with dots and splits the input by semicolons.
   * @param rpeString - The RPE input string.
   * @returns An array of parsed RPE numbers.
   */
  private parseRPEInput(rpeString: string): number[] {
    return rpeString
      .replace(/,/g, '.')
      .split(';')
      .map((value) => parseFloat(value.trim()))
      .filter((num) => !isNaN(num));
  }

  /**
   * Validates a single RPE value to ensure it falls within the acceptable range.
   * Dispatches a change event to reflect the updates.
   * @param rpe - The RPE value to validate.
   * @param rpeInput - The HTML input element containing the RPE value.
   */
  private validateSingleRPE(rpe: number, rpeInput: HTMLInputElement): void {
    if (rpe < this.MIN_RPE) {
      rpeInput.value = this.MIN_RPE.toString();
    } else if (rpe > this.MAX_RPE) {
      rpeInput.value = this.MAX_RPE.toString();
    } else {
      rpeInput.value = rpe.toString();
    }
  }

  /**
   * Validates multiple RPE values and updates the corresponding elements.
   * Calculates the average RPE and updates the input accordingly.
   * @param rpeInput - The HTML input element containing the RPE values.
   * @param numbers - The array of RPE values to validate.
   */
  private validateMultipleRPEs(rpeInput: HTMLInputElement, numbers: number[]): void {
    const setInput = this.exerciseTableRowService.getSetInputByElement(rpeInput);

    if (numbers.length === Number(setInput.value)) {
      const averageRPE = this.calculateAverageRPE(numbers);
      this.validateSingleRPE(averageRPE, rpeInput);
    } else {
      rpeInput.value = '';
    }
  }

  /**
   * Calculates the average of an array of RPE values.
   * Rounds the average to the nearest 0.5.
   * @param numbers - The array of RPE values.
   * @returns The rounded average RPE.
   */
  private calculateAverageRPE(numbers: number[]): number {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    return Math.ceil(average / 0.5) * 0.5;
  }
}
