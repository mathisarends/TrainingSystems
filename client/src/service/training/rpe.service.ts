import { Injectable } from '@angular/core';
import { ExerciseTableRowService } from './exercise-table-row.service';

@Injectable({
  providedIn: 'root',
})
export class RpeService {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;
  private readonly changeEvent = new Event('change', { bubbles: true });

  constructor(private exerciseTableRow: ExerciseTableRowService) {}

  /**
   * Initializes the RPE validation by adding event listeners to the target and actual RPE inputs.
   */
  initializeRPEValidation(): void {
    this.addEventListenersToRPEInputs('.targetRPE', this.handleTargetRPEChange.bind(this));
    this.addEventListenersToRPEInputs('.actualRPE', this.handleActualRPEChange.bind(this));
  }

  /**
   * Adds event listeners to RPE input elements.
   * @param selector - The CSS selector for the RPE input elements.
   * @param handler - The event handler function to be called on change.
   */
  private addEventListenersToRPEInputs(selector: string, handler: (event: Event) => void): void {
    const inputs = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.addEventListener('change', handler);
    });
  }

  /**
   * Handles the change event for target RPE inputs.
   * Validates the RPE values and updates the input accordingly.
   * @param event - The change event triggered by the target RPE input.
   */
  private handleTargetRPEChange(event: Event): void {
    const targetRPEInput = event.target as HTMLInputElement;
    const targetRPE: number = parseInt(targetRPEInput.value);
    this.validateSingleRPE(targetRPE, targetRPEInput);
  }

  /**
   * Handles the change event for actual RPE inputs.
   * Validates the RPE values and updates the workout notes accordingly.
   * @param event - The change event triggered by the actual RPE input.
   */
  private handleActualRPEChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const rpeValues = this.parseRPEInput(target.value);

    if (rpeValues.length === 1) {
      this.validateSingleRPE(rpeValues[0], target);
    } else {
      this.validateMultipleRPEs(target, rpeValues);
    }
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
    rpeInput.dispatchEvent(this.changeEvent);
  }

  /**
   * Validates multiple RPE values and updates the corresponding elements.
   * Calculates the average RPE and updates the input accordingly.
   * @param rpeInput - The HTML input element containing the RPE values.
   * @param numbers - The array of RPE values to validate.
   */
  private validateMultipleRPEs(rpeInput: HTMLInputElement, numbers: number[]): void {
    const setInput = this.exerciseTableRow.getSetInputByElement(rpeInput);

    if (numbers.length === Number(setInput.value)) {
      const averageRPE = this.calculateAverageRPE(numbers);
      this.validateSingleRPE(averageRPE, rpeInput);
    } else {
      rpeInput.value = '';
      rpeInput.dispatchEvent(this.changeEvent);
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
