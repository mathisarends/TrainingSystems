import { Injectable } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElement } from '../../../../shared/types/interactive-element.types';
import { Exercise } from '../training-exercise';
import { ExerciseTableRowService } from './exercise-table-row.service';
import { TrainingPlanDataService } from './training-plan-data.service';

@Injectable()
export class EstMaxService {
  categoriesWithEstMax = ['Squat', 'Bench', 'Deadlift', 'Overheadpress'];

  constructor(
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
    private trainingPlanDataService: TrainingPlanDataService,
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

  calculateMaxAfterInputChange(event: Event) {
    const target = event.target as InteractiveElement;
    const category = this.exerciseTableRowService.getExerciseCategorySelectorByElement(target).value;

    if (this.shouldCalculateEstMaxForCategory(category)) {
      const { weightInput, setsInput, rpeInput, estMaxInput } = this.exerciseTableRowService.getInputsByElement(target);

      const weight = parseFloat(weightInput.value);
      const sets = parseFloat(setsInput.value);
      const rpe = parseFloat(rpeInput.value);

      if (weight && sets && rpe) {
        const estMax = this.calcEstMax(weight, sets, rpe);
        estMaxInput.value = estMax.toString();
        this.formService.addChange(estMaxInput.name, estMaxInput.value);

        const nextExerciseCategory = weightInput
          .closest('tr')
          ?.nextElementSibling?.querySelector('.exercise-name-selector select') as HTMLSelectElement | undefined;
        if (nextExerciseCategory && nextExerciseCategory?.ariaValueMax === category) {
          const nextExerciseReps = parseFloat(
            this.exerciseTableRowService.getRepsInputByElement(nextExerciseCategory).value,
          );
          const nextExerciseRpe = parseFloat(
            this.exerciseTableRowService.getPlanedRpeByElement(nextExerciseCategory).value,
          );

          if (nextExerciseReps && nextExerciseRpe) {
            const backoffWeight = this.calcBackoff(nextExerciseReps, nextExerciseRpe, estMax);
            const nextRowWeightInput = this.exerciseTableRowService.getWeightInputByElement(nextExerciseCategory);
            nextRowWeightInput.placeholder = backoffWeight.toString();
          }
        }
      }
    }
  }

  // um die daten im UI zu aktualisieren müssen wir eignetlich auf der Training Plan Data im Modul über einen Service arbeiten

  /**
   * Handles input change events to trigger estimated max calculation.
   * @param event - The input change event.
   */
  private handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const exerciseData = this.getExerciseFromTargetNameAttribut(target.name);

    const category = this.exerciseTableRowService.getExerciseCategorySelectorByElement(target).value;
    const parentRow = target.closest('tr')!;

    if (this.shouldCalculateEstMaxForCategory(category)) {
      const weight = parseFloat(this.exerciseTableRowService.getWeightInputByElement(target).value);
      const reps = parseInt(this.exerciseTableRowService.getRepsInputByElement(target).value);
      const rpe = parseFloat(this.exerciseTableRowService.getActualRPEByElement(target).value);
      if (weight > 0 && reps && rpe) {
        const estMax = this.calcEstMax(weight, reps, rpe);
        const estMaxInput = this.exerciseTableRowService.getEstMaxByElement(target);

        estMaxInput.value = estMax.toString();
        exerciseData.estMax = estMax;

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

  private getExerciseFromTargetNameAttribut(nameAttr: string): Exercise {
    const exerciseIndex = this.extractExerciseIndexFromName(nameAttr) - 1;

    const exercise = this.trainingPlanDataService.trainingPlanData?.trainingDay?.exercises?.[exerciseIndex];

    if (!exercise) {
      throw new Error('Invalid exercise values for calculating max');
    }

    return exercise;
  }
  /**
   * Calculates the estimated maximum weight based on weight, reps, and RPE.
   * @param weight - The weight lifted.
   * @param reps - The number of repetitions performed.
   * @param rpe - The rating of perceived exertion.
   * @returns The calculated estimated max weight.
   */
  private calcEstMax(weight: number, reps: number, rpe: number): number {
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

  /**
   * Extracts the exercise index from the input name.
   * @param inputName - The name attribute of the input element (e.g., "day0_exercise1_weight").
   * @returns The exercise index as a number or null if no match is found.
   */
  private extractExerciseIndexFromName(inputName: string): number {
    const regex = /exercise(\d+)/;
    const match = regex.exec(inputName);

    if (!match) {
      throw new Error('The name attribute of the input element is invalid');
    }

    return Number(match[1]);
  }

  /**
   * Determines if the estimated max should be calculated for the given category.
   */
  private shouldCalculateEstMaxForCategory(category: string): boolean {
    return this.categoriesWithEstMax.includes(category);
  }
}
