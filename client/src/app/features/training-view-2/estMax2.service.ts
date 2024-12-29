import { Injectable } from '@angular/core';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { InputParsingService } from '../../shared/service/input-parsing.service';

@Injectable({
  providedIn: 'root',
})
export class EstMaxService2 {
  categoriesWithEstMax = ['Squat', 'Bench', 'Deadlift', 'Overheadpress'];

  constructor(private inputParsingService: InputParsingService) {}

  /**
   * Calculates the estimated maximum weight using the Wathan formula, incorporating actual reps adjusted for RPE.
   */
  calcEstMax(exercise: Exercise): number | undefined {
    if (!this.categoriesWithEstMax.includes(exercise.category) || !exercise.weight || !exercise.actualRPE) {
      return undefined;
    }

    const weightInputs = this.inputParsingService.parseInputValues(exercise.weight!);
    const averageWeight = weightInputs.length
      ? this.inputParsingService.calculateRoundedAverage(weightInputs, 2.5)
      : undefined;

    const actualRpeInputs = this.inputParsingService.parseInputValues(exercise.actualRPE);
    const averageActualRpe = actualRpeInputs.length
      ? this.inputParsingService.calculateRoundedAverage(actualRpeInputs, 0.5)
      : undefined;

    if (!averageWeight || !averageActualRpe) {
      return undefined;
    }

    const actualReps = exercise.reps + (10 - averageActualRpe);
    const rawValue = averageWeight * (1 + actualReps / 30);

    return Math.ceil(rawValue / 2.5) * 2.5;
  }

  /**
   * Calculates the backoff weight for the next exercise based on planned reps, RPE, and the top set max.
   */
  calcBackoffForNextExercise(currentExercise: Exercise, allExercises: Exercise[]): number | undefined {
    const currentIndex = allExercises.findIndex((ex) => ex.id === currentExercise.id);
    if (currentIndex === -1 || currentIndex >= allExercises.length - 1) {
      return undefined;
    }

    const nextExercise = allExercises[currentIndex + 1];

    if (nextExercise.exercise !== currentExercise.exercise) {
      return undefined;
    }

    const topSetMax = this.calcEstMax(currentExercise);
    if (!topSetMax) {
      return undefined;
    }

    return this.calcBackoff(nextExercise.reps, nextExercise.targetRPE, topSetMax);
  }

  /**
   * Calculates the backoff weight for a single exercise.
   */
  private calcBackoff(planedReps: number, planedRPE: number, topSetMax: number): number {
    const totalReps = planedReps + (10 - planedRPE);
    let percentage = (0.484472 * totalReps * totalReps - 33.891 * totalReps + 1023.67) * 0.001;
    let backoffWeight = topSetMax * percentage;
    backoffWeight = Math.ceil(backoffWeight / 2.5) * 2.5;

    return backoffWeight;
  }
}
