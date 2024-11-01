import { Injectable } from '@angular/core';
import { FormService } from '../../../../core/services/form.service';
import { UserBestPerformanceService } from '../../../../shared/service/user-best-performance/user-best-performance.service';
import { ExerciseTableRowService } from './exercise-table-row.service';

@Injectable()
export class EstMaxService {
  categoriesWithEstMax = ['Squat', 'Bench', 'Deadlift', 'Overheadpress'];

  constructor(
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
    private userBestPerformanceService: UserBestPerformanceService,
  ) {}

  calculateMaxAfterInputChange(inputElement: HTMLInputElement) {
    const category = this.exerciseTableRowService.getExerciseCategorySelectorByElement(inputElement).value;

    if (this.shouldCalculateEstMaxForCategory(category)) {
      const { exerciseSelect, weightInput, repsInput, rpeInput, estMaxInput } =
        this.exerciseTableRowService.getInputsByElement(inputElement);

      const weight = parseFloat(weightInput.value);
      const reps = parseFloat(repsInput.value);
      const rpe = parseFloat(rpeInput.value);

      if (!weight || !reps || !rpe) {
        return;
      }

      const estMax = this.calcEstMax(weight, reps, rpe);
      estMaxInput.value = estMax.toString();

      const exercise = this.userBestPerformanceService.determineExerciseBasedOnFieldName(estMaxInput.name);

      if (exercise && this.userBestPerformanceService.isNewBestPerformance(exercise)) {
        this.userBestPerformanceService.makeNewBestPerformanceEntry(exercise);
      this.userBestPerformanceService.startConfetti();
      }
    

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
   * Determines if the estimated max should be calculated for the given category.
   */
  private shouldCalculateEstMaxForCategory(category: string): boolean {
    return this.categoriesWithEstMax.includes(category);
  }
}
