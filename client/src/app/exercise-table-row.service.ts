import { Injectable } from '@angular/core';

enum ExerciseTableRowInputType {
  CATEGORY_SELECTOR = '.exercise-category-selector',
  EXERCISE_SELECTOR = '.exercise-name-selector:not([disabled])[style*="display: block"]',
  SETS_INPUT = '.sets',
  REPS_INPUT = '.reps',
  WEIGHT_INPUT = '.weight',
  TARGET_RPE_INPUT = '.targetRPE',
  ACTUAL_RPE_INPUT = '.actualRPE',
  EST_MAX_INPUT = '.estMax',
}

@Injectable({
  providedIn: 'root',
})
export class ExerciseTableRowService {
  /**
   * List of allowed class names for validation.
   */
  allowedElementClassList = [
    'exercise-category-selector',
    'exercise-name-selector',
    'sets',
    'reps',
    'weight',
    'targetRPE',
    'actualRPE',
    'estMax',
  ];

  /**
   * Finds the `HTMLSelectElement` for the exercise category within the same table row as the provided element.
   *
   * @param element The reference element within the table row.
   */
  getExerciseCategorySelectorByElement(element: HTMLElement): HTMLSelectElement {
    return this.getElementByType(element, ExerciseTableRowInputType.CATEGORY_SELECTOR) as HTMLSelectElement;
  }

  /**
   * Finds the `HTMLSelectElement` for the visible and enabled exercise name within the same table row as the provided element.
   *
   * @param element The reference element within the table row.
   */
  getExerciseSelectorByElement(element: HTMLElement): HTMLSelectElement {
    return this.getElementByType(element, ExerciseTableRowInputType.EXERCISE_SELECTOR) as HTMLSelectElement;
  }

  /**
   * Finds the `HTMLInputElement` for the weight input within the same table row as the provided element.
   *
   * @param element The reference element within the table row.
   */
  getWeightInputByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.WEIGHT_INPUT) as HTMLInputElement;
  }

  /**
   * Finds the `HTMLInputElement` for the number of sets within the same table row as the provided element.
   *
   * @param element The reference element within the table row.
   */
  getSetInputByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.SETS_INPUT) as HTMLInputElement;
  }

  /**
   * Finds the input element or select element within the same table row as the provided element, based on the specified input type.
   *
   * @param element The reference element within the table row.
   * @param inputType The type of input to find, based on the ExerciseTableRowInputType enum.
   * @returns The found HTMLElement or null if not found.
   */
  getElementByType(element: HTMLElement, inputType: ExerciseTableRowInputType): HTMLElement | null {
    return this.findClosestElementInRow(element, inputType);
  }
  /**
   * Finds the closest element within the same table row based on the provided selector.
   *
   * @param element The reference element within the table row.
   * @param selector The CSS selector for the target element.
   */
  private findClosestElementInRow(element: HTMLElement, selector: string): HTMLElement | null {
    const foundElement = element.closest('tr')?.querySelector(selector) as HTMLElement | null;

    if (!foundElement) {
      throw new Error(`Element with selector ${selector} not found in the same table row.`);
    }

    return foundElement;
  }
}
