import { Injectable } from '@angular/core';
import { Exercise } from '../training-plans/training-view/training-exercise';

@Injectable({
  providedIn: 'root',
})
export class EstMaxService2 {
  categoriesWithEstMax = ['Squat', 'Bench', 'Deadlift', 'Overheadpress'];

  /**
   * Calculates the estimated maximum weight using the Wathan formula, incorporating actual reps adjusted for RPE.
   */
  calcEstMax(exercise: Exercise): number | undefined {
    if (!this.areInputsValid(exercise)) {
      return undefined;
    }

    const actualReps = exercise.reps + (10 - Number(exercise.actualRPE));
    const rawValue = Number(exercise.weight) * (1 + actualReps / 30);

    return Math.ceil(rawValue / 2.5) * 2.5;
  }

  /**
   * Calculates the backoff weight for the next set based on planned reps, RPE, and the top set max.
   */
  calcBackoff(planedReps: number, planedRPE: number, topSetMax: number): number {
    const totalReps = planedReps + (10 - planedRPE);
    let percentage = (0.484472 * totalReps * totalReps - 33.891 * totalReps + 1023.67) * 0.001;
    let backoffWeight = topSetMax * percentage;
    backoffWeight = Math.ceil(backoffWeight / 2.5) * 2.5;

    return backoffWeight;
  }

  /**
   * Checks if the inputs in the exercise object are valid.
   * This includes validating the category, weight, actualRPE, and reps.
   *
   * @param exercise - The exercise object to validate.
   * @returns True if inputs are valid, false otherwise.
   */
  private areInputsValid(exercise: Exercise): boolean {
    const weight = Number(exercise.weight);
    const actualRPE = Number(exercise.actualRPE);
    const reps = exercise.reps;

    if (!this.categoriesWithEstMax.includes(exercise.category)) {
      return false;
    }

    if (isNaN(weight)) {
      return false;
    }

    if (isNaN(actualRPE)) {
      return false;
    }

    return reps > 0;
  }
}
