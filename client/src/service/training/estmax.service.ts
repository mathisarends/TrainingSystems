import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EstMaxService {
  private readonly SQUAT_MAX_ID = 'userMaxSquat';
  private readonly BENCH_MAX_ID = 'userMaxBench';
  private readonly DEADLIFT_MAX_ID = 'userMaxDeadlift';

  /**
   * Initializes the event listeners for weight, actual RPE, and reps inputs to calculate estimated max.
   */
  initializeEstMaxCalculation(): void {
    const weightInputs = document.querySelectorAll(
      '.weight'
    ) as NodeListOf<HTMLInputElement>;
    const actualRpeInputs = document.querySelectorAll(
      '.actualRPE'
    ) as NodeListOf<HTMLInputElement>;
    const repsInputs = document.querySelectorAll(
      '.reps'
    ) as NodeListOf<HTMLInputElement>;

    weightInputs.forEach((input) =>
      input.addEventListener('change', (e) => this.handleInputChange(e))
    );
    actualRpeInputs.forEach((input) =>
      input.addEventListener('change', (e) => this.handleInputChange(e))
    );
    repsInputs.forEach((input) =>
      input.addEventListener('change', (e) => this.handleInputChange(e))
    );
  }

  /**
   * Handles input change events to trigger estimated max calculation.
   * @param event - The input change event.
   */
  private handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log('🚀 ~ EstMaxService ~ handleInputChange ~ target:', target);

    if (
      target &&
      (target.classList.contains('weight') ||
        target.classList.contains('actualRPE') ||
        target.classList.contains('reps'))
    ) {
      const parentRow = target.closest('tr');
      if (!parentRow) {
        console.error('Parent row not found');
        return;
      }

      const category = (
        parentRow.querySelector(
          '.exercise-category-selector'
        ) as HTMLInputElement
      )?.value;

      if (
        category === 'Squat' ||
        category === 'Bench' ||
        category === 'Deadlift'
      ) {
        const weight = parseFloat(
          (parentRow.querySelector('.weight') as HTMLInputElement)?.value
        );
        const reps = parseInt(
          (parentRow.querySelector('.reps') as HTMLInputElement)?.value
        );
        const rpe = parseFloat(
          (parentRow.querySelector('.actualRPE') as HTMLInputElement)?.value
        );
        if (weight && reps && rpe) {
          const estMax = this.calcEstMax(weight, reps, rpe, category);
          const estMaxInput = parentRow.querySelector(
            '.estMax'
          ) as HTMLInputElement;
          estMaxInput.value = estMax.toString();

          const changeEvent = new Event('change', { bubbles: true });
          estMaxInput.dispatchEvent(changeEvent);

          const nextRow = parentRow.nextElementSibling!;
          const exercise = (
            parentRow.querySelector(
              '.exercise-name-selector:not([style*="display: none"])'
            ) as HTMLInputElement
          )?.value;
          const nextExercise = (
            nextRow.querySelector(
              '.exercise-name-selector:not([style*="display: none"])'
            ) as HTMLInputElement
          )?.value;
          const nextWeightInputValue = (
            nextRow.querySelector('.weight') as HTMLInputElement
          )?.value;

          if (
            nextRow &&
            exercise === nextExercise &&
            estMax &&
            !nextWeightInputValue
          ) {
            const nextRowReps = parseInt(
              (nextRow.querySelector('.reps') as HTMLInputElement)?.value
            );
            const nextRowRPE = parseFloat(
              (nextRow.querySelector('.targetRPE') as HTMLInputElement)?.value
            );

            if (nextRowReps && nextRowRPE) {
              const backoffWeight = this.calcBackoff(
                nextRowReps,
                nextRowRPE,
                estMax
              );
              const nextRowWeightInput = nextRow.querySelector(
                '.weight'
              ) as HTMLInputElement;
              nextRowWeightInput.placeholder = backoffWeight.toString();
            }
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
  private calcEstMax(
    weight: number,
    reps: number,
    rpe: number,
    category: string
  ): number {
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
  private calcBackoff(
    planedReps: number,
    planedRPE: number,
    topSetMax: number
  ): string {
    const totalReps = planedReps + (10 - planedRPE);
    let percentage =
      (0.484472 * totalReps * totalReps - 33.891 * totalReps + 1023.67) * 0.001;
    let backoffWeight = topSetMax * percentage;
    backoffWeight = Math.ceil(backoffWeight / 2.5) * 2.5;

    const lowEndBackoffWeight = backoffWeight - 2.5;
    const highEndBackoffWeight = backoffWeight + 2.5;

    return `${lowEndBackoffWeight} - ${highEndBackoffWeight}`;
  }

  /**
   * Retrieves the all-time best estimated max for the given category.
   * @param category - The exercise category (e.g., Squat, Bench, Deadlift).
   * @returns The maximum weight for the category.
   */
  private getMaxByCategory(category: string): number {
    if (category === 'Squat') {
      return parseInt(
        (document.getElementById(this.SQUAT_MAX_ID) as HTMLInputElement).value
      );
    } else if (category === 'Bench') {
      return parseInt(
        (document.getElementById(this.BENCH_MAX_ID) as HTMLInputElement).value
      );
    } else {
      return parseInt(
        (document.getElementById(this.DEADLIFT_MAX_ID) as HTMLInputElement)
          .value
      );
    }
  }
}
