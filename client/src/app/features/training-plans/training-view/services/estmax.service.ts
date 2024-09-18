import { Injectable } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { ExerciseTableRowService } from './exercise-table-row.service';

@Injectable({
  providedIn: 'root',
})
export class EstMaxService {
  constructor(
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
  ) {}

  /**
   * Initializes the event listeners for weight, actual RPE, and reps inputs to calculate estimated max.
   */
  initializeEstMaxCalculation(): void {
    const weightInputs = document.querySelectorAll('.weight-data-cell input');
    const actualRpeInputs = document.querySelectorAll('.actualRPE input');
    const repsInputs = document.querySelectorAll('.reps input');

    weightInputs.forEach((input) => input.addEventListener('change', (e) => this.handleInputChange(e)));
    actualRpeInputs.forEach((input) => input.addEventListener('change', (e) => this.handleInputChange(e)));
    repsInputs.forEach((input) => input.addEventListener('change', (e) => this.handleInputChange(e)));
  }

  /**
   * Handles input change events to trigger estimated max calculation.
   * @param event - The input change event.
   */
  private handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    const category = this.exerciseTableRowService.getExerciseCategorySelectorByElement(target).value;
    const parentRow = target.closest('tr')!;

    if (category === 'Squat' || category === 'Bench' || category === 'Deadlift') {
      const weight = parseFloat(this.exerciseTableRowService.getWeightInputByElement(target).value);
      const reps = parseInt(this.exerciseTableRowService.getRepsInputByElement(target).value);
      const rpe = parseFloat(this.exerciseTableRowService.getActualRPEByElement(target).value);
      if (weight > 0 && reps && rpe) {
        const estMax = this.calcEstMax(weight, reps, rpe, category);
        const estMaxInput = this.exerciseTableRowService.getEstMaxByElement(target);

        estMaxInput.value = estMax.toString();
        this.formService.addChange(estMaxInput.name, estMaxInput.value);

        const nextRow = parentRow.nextElementSibling as HTMLElement;
        const exercise = (
          parentRow.querySelector('.exercise-name-selector:not([style*="display: none"])') as HTMLInputElement
        )?.value;
        const nextExercise = (
          nextRow.querySelector('.exercise-name-selector:not([style*="display: none"])') as HTMLInputElement
        )?.value;
        const nextWeightInputValue = this.exerciseTableRowService.getWeightInputByElement(nextRow).value;

        if (nextRow && exercise === nextExercise && estMax && !nextWeightInputValue) {
          const nextRowReps = parseInt(this.exerciseTableRowService.getRepsInputByElement(nextRow).value);
          const nextRowRPE = parseFloat(this.exerciseTableRowService.getPlanedRpeByElement(nextRow).value);

          if (nextRowReps && nextRowRPE) {
            const backoffWeight = this.calcBackoff(nextRowReps, nextRowRPE, estMax);
            const nextRowWeightInput = nextRow.querySelector('.weight') as HTMLInputElement;
            nextRowWeightInput.placeholder = backoffWeight.toString();
          }
        }
      }
    }
  }

  /**
   * Calculates the estimated maximum weight based on weight, reps, and RPE.
   * @param weight - The weight lifted.
   * @param reps - The number of repetitions performed.
   * @param rpe - The rating of perceived exertion.
   * @param category - The exercise category (e.g., Squat, Bench, Deadlift).
   * @returns The calculated estimated max weight.
   */
  private calcEstMax(weight: number, reps: number, rpe: number, category: string): number {
    const actualReps = reps + (10 - rpe);
    const unroundedValue = weight * (1 + 0.0333 * actualReps);
    const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;
    return roundedValue;
  }

  /**
   * Calculates the backoff weight for the next set based on planned reps, RPE, and the top set max.
   * @param planedReps - The planned number of repetitions.
   * @param planedRPE - The planned rating of perceived exertion.
   * @param topSetMax - The top set maximum weight.
   * @returns The calculated backoff weight range as a string.
   */
  private calcBackoff(planedReps: number, planedRPE: number, topSetMax: number): string {
    const totalReps = planedReps + (10 - planedRPE);
    let percentage = (0.484472 * totalReps * totalReps - 33.891 * totalReps + 1023.67) * 0.001;
    let backoffWeight = topSetMax * percentage;
    backoffWeight = Math.ceil(backoffWeight / 2.5) * 2.5;

    const lowEndBackoffWeight = backoffWeight - 2.5;
    const highEndBackoffWeight = backoffWeight + 2.5;

    return `${lowEndBackoffWeight} - ${highEndBackoffWeight}`;
  }
}
