import { Injectable } from '@angular/core';
import { InteractiveElement } from './interactive-element';
import { ExerciseInputs } from './exercise-inputs';

enum ExerciseTableRowInputType {
  CATEGORY_SELECTOR = '.exercise-category-selector',
  EXERCISE_SELECTOR_GENERIC = '.exercise-name-selector',
  EXERCISE_SELECTOR = '.exercise-name-selector:not([disabled])[style*="display: block"]',
  SETS_INPUT = 'app-input.sets input',
  REPS_INPUT = 'app-input.reps input',
  WEIGHT_INPUT = 'app-input.weight input',
  TARGET_RPE_INPUT = 'app-input.targetRPE input',
  ACTUAL_RPE_INPUT = 'app-input.actualRPE input',
  EST_MAX_INPUT = 'app-input.estMax input',
  NOTES = 'app-input.notes input',
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

  getAllExerciseCategorySelectorsByElement(element: HTMLElement): NodeListOf<HTMLSelectElement> {
    const tableRow = element.closest('tr');
    const exerciseNameSelectors = tableRow?.querySelectorAll(
      '.exercise-name-selector',
    ) as NodeListOf<HTMLSelectElement>;
    return exerciseNameSelectors;
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

  getRepsInputByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.REPS_INPUT) as HTMLInputElement;
  }

  /**
   * Finds the `HTMLInputElement` for the number of sets within the same table row as the provided element.
   *
   * @param element The reference element within the table row.
   */
  getPlanedRpeByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.TARGET_RPE_INPUT) as HTMLInputElement;
  }

  getActualRPEByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.ACTUAL_RPE_INPUT) as HTMLInputElement;
  }

  getEstMaxByElement(element: HTMLElement): HTMLInputElement {
    return this.getElementByType(element, ExerciseTableRowInputType.EST_MAX_INPUT) as HTMLInputElement;
  }

  /**
   * Finds all related input elements in the same table row as the provided category selector element.
   *
   * @param categorySelector The HTMLSelectElement for the exercise category.
   * @returns An object containing all relevant input elements.
   */
  getInputsByCategorySelector(categorySelector: HTMLSelectElement, resetMode = false): ExerciseInputs {
    return {
      exerciseSelect: this.findClosestElementInRow(
        categorySelector,
        resetMode ? ExerciseTableRowInputType.EXERCISE_SELECTOR_GENERIC : ExerciseTableRowInputType.EXERCISE_SELECTOR,
      ) as HTMLSelectElement,
      setsInput: this.findClosestElementInRow(
        categorySelector,
        ExerciseTableRowInputType.SETS_INPUT,
      ) as HTMLInputElement,
      repsInput: this.findClosestElementInRow(
        categorySelector,
        ExerciseTableRowInputType.REPS_INPUT,
      ) as HTMLInputElement,
      weightInput: this.findClosestElementInRow(
        categorySelector,
        ExerciseTableRowInputType.WEIGHT_INPUT,
      ) as HTMLInputElement,
      targetRPEInput: this.findClosestElementInRow(
        categorySelector,
        ExerciseTableRowInputType.TARGET_RPE_INPUT,
      ) as HTMLInputElement,
      rpeInput: this.findClosestElementInRow(
        categorySelector,
        ExerciseTableRowInputType.ACTUAL_RPE_INPUT,
      ) as HTMLInputElement,
      estMaxInput: this.findClosestElementInRow(
        categorySelector,
        ExerciseTableRowInputType.EST_MAX_INPUT,
      ) as HTMLInputElement,
    };
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

  findClosestElementInRow(element: HTMLElement, selector: string): InteractiveElement {
    const tableRow = element.closest('tr');
    if (!tableRow) {
      throw new Error('The element is not contained within a table row.');
    }

    const associatedElement = tableRow.querySelector(selector);
    if (!associatedElement) {
      throw new Error(`No matching element found for selector: ${selector}`);
    }

    return associatedElement as InteractiveElement;
  }
}
