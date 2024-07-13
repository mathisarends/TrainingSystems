import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RpeService {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;
  private readonly changeEvent = new Event('change', { bubbles: true });

  /**
   * Validates the RPE value to ensure it falls within the acceptable range.
   * Dispatches a change event to reflect the updates.
   * @param rpe - The RPE value to validate.
   * @param rpeInput - The HTML input element containing the RPE value.
   */
  validateRPE(rpe: number, rpeInput: HTMLInputElement): void {
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
   * Initializes the RPE validation by adding event listeners to the target and actual RPE inputs.
   */
  initializeRPEValidation(): void {
    const targetRPEInputs = document.querySelectorAll(
      '.targetRPE'
    ) as NodeListOf<HTMLInputElement>;
    targetRPEInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const targetRPEInput = e.target as HTMLInputElement;
        const targetRPE: number = parseInt(targetRPEInput.value);
        this.validateRPE(targetRPE, targetRPEInput);
      });
    });

    const actualRPEInputs = document.querySelectorAll(
      '.actualRPE'
    ) as NodeListOf<HTMLInputElement>;
    actualRPEInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        this.handleActualRPEChange(e);
      });
    });
  }

  /**
   * Handles the change event for actual RPE inputs.
   * Validates the RPE values and updates the workout notes accordingly.
   * @param event - The change event triggered by the actual RPE input.
   */
  private handleActualRPEChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    let rpe = target.value;

    if (rpe === '') {
      target.value = '';
      target.dispatchEvent(this.changeEvent);
      return;
    }

    rpe = rpe.replace(/,/g, '.'); // Replace commas with dots
    const numbers = rpe.split(';').map(Number);
    console.log('🚀 ~ RpeService ~ handleActualRPEChange ~ numbers:', numbers);

    if (numbers.length === 1 && !isNaN(numbers[0])) {
      this.validateSingleRPE(target, numbers[0]);
      return;
    }

    if (numbers.some(isNaN)) {
      target.value = '';
      target.dispatchEvent(this.changeEvent);
      return;
    }

    this.validateMultipleRPEs(target, numbers);
  }

  /**
   * Validates a single RPE value and updates the corresponding elements.
   * @param rpeInput - The HTML input element containing the RPE value.
   * @param rpe - The RPE value to validate.
   */
  private validateSingleRPE(rpeInput: HTMLInputElement, rpe: number): void {
    this.validateRPE(rpe, rpeInput);

    const parentRow = rpeInput.closest('tr')!;
    const planedRPE = parentRow.querySelector('.targetRPE') as HTMLInputElement;
    const workoutNotes = parentRow.querySelector(
      '.workout-notes'
    ) as HTMLInputElement;

    const rpeDiff = parseFloat(planedRPE.value) - rpe;
  }

  /**
   * Validates multiple RPE values and updates the corresponding elements.
   * Calculates the average RPE and updates the input accordingly.
   * @param rpeInput - The HTML input element containing the RPE values.
   * @param numbers - The array of RPE values to validate.
   */
  private validateMultipleRPEs(
    rpeInput: HTMLInputElement,
    numbers: number[]
  ): void {
    const parentRow = rpeInput.closest('tr')!;
    const setInputs = parentRow.querySelector('.sets') as HTMLInputElement;

    if (numbers.length === parseInt(setInputs.value)) {
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      const average = sum / numbers.length;

      const roundedAverage = Math.ceil(average / 0.5) * 0.5;
      const planedRPE = parentRow.querySelector(
        '.targetRPE'
      ) as HTMLInputElement;
      const workoutNotes = parentRow.querySelector(
        '.workout-notes'
      ) as HTMLInputElement;

      const rpeDiff = parseFloat(planedRPE.value) - roundedAverage;
      this.validateRPE(roundedAverage, rpeInput);
    }
  }
}
