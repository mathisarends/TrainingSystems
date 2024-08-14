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
   * Finds the `HTMLInputElement` for the number of sets within the same table row as the provided element.
   *
   * @param element The reference element within the table row.
   */
  getPlanedRpeByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.TARGET_RPE_INPUT) as HTMLInputElement;
  }

  /**
   * Finds the input element or select element within the same table row as the provided element, based on the specified input type.
   *
   * @param element The reference element within the table row.
   * @param inputType The type of input to find, based on the ExerciseTableRowInputType enum.
   * @returns The found HTMLElement or null if not found.
   */
  getElementByType(element: HTMLElement, inputType: ExerciseTableRowInputType): HTMLElement {
    return this.findClosestElementInRow(element, inputType);
  }

  /**
   * Finds the closest element within the same table row based on the provided selector.
   *
   * @param element The reference element within the table row.
   * @param selector The CSS selector for the target element.
   * @returns The found HTMLElement.
   * @throws Will throw an error if no matching element is found.
   */

  private findClosestElementInRow(element: HTMLElement, selector: string): HTMLElement {
    const tableRow = element.closest('tr');
    if (!tableRow) {
      throw new Error('The element is not contained within a table row.');
    }

    const associatedElement = tableRow.querySelector(selector);
    if (!associatedElement) {
      throw new Error(`No matching element found for selector: ${selector}`);
    }

    return associatedElement as HTMLElement;
  }
}
