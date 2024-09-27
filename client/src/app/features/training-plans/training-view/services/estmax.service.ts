import { Injectable } from '@angular/core';
import { FormService } from '../../../../core/services/form.service';
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

  calculateMaxAfterInputChange(inputElement: HTMLInputElement) {
    const category = this.exerciseTableRowService.getExerciseCategorySelectorByElement(inputElement).value;
    const exerciseData = this.getExerciseFromTargetNameAttribut(inputElement.name);

    if (this.shouldCalculateEstMaxForCategory(category)) {
      const { exerciseSelect, weightInput, repsInput, rpeInput, estMaxInput } =
        this.exerciseTableRowService.getInputsByElement(inputElement);

      const weight = parseFloat(weightInput.value);
      const reps = parseFloat(repsInput.value);
      const rpe = parseFloat(rpeInput.value);

      if (weight && reps && rpe) {
        const estMax = this.calcEstMax(weight, reps, rpe);
        estMaxInput.value = estMax.toString();
        exerciseData.estMax = estMax;

        this.formService.addChange(estMaxInput.name, estMaxInput.value);

        const nextExerciseCategory = weightInput
          .closest('tr')
          ?.nextElementSibling?.querySelector('.exercise-name-selector select') as HTMLSelectElement | undefined;

        if (nextExerciseCategory?.value === exerciseSelect.value) {
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

  private getExerciseFromTargetNameAttribut(nameAttr: string): Exercise {
    const exerciseIndex = this.extractExerciseIndexFromName(nameAttr) - 1;

    const exercise = this.trainingPlanDataService.trainingPlanData?.trainingDay?.exercises?.[exerciseIndex];

    if (!exercise) {
      throw new Error('Invalid exercise values for calculating max');
    }

    return exercise;
  }

  /**
   * Calculates the estimated maximum weight using the Wathan formula, incorporating actual reps adjusted for RPE.
   *
   * @param weight - The weight lifted.
   * @param reps - The number of repetitions performed.
   * @param rpe - The rating of perceived exertion (RPE).
   * @returns The calculated estimated max weight.
   */
  private calcEstMax(weight: number, reps: number, rpe: number): number {
    const actualReps = reps + (10 - rpe);
    const unroundedValue = weight * (1 + actualReps / 30);

    return Math.ceil(unroundedValue / 2.5) * 2.5;
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
