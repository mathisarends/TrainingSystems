import { Directive, HostListener, Renderer2, RendererFactory2 } from '@angular/core';
import { InteractiveElementService } from '../service/util/interactive-element.service';
import { FormService } from '../service/form/form.service';
import { ExerciseTableRowService } from '../service/training/exercise-table-row.service';
import { ExerciseDataService } from '../app/Pages/training-view/exercise-data.service';
import { RepSchemeByCategory } from '../app/Pages/training-view/default-rep-scheme-by-category';

@Directive({
  selector: '[category-select]',
  standalone: true,
})
export class CategorySelectDirective {
  private renderer: Renderer2;

  constructor(
    protected interactiveElementService: InteractiveElementService,
    protected formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
    private exerciseDataService: ExerciseDataService,
    private rendererFactory: RendererFactory2,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Handles the focus event of the interactive element.
   * When the element gains focus, its value is stored by the InteractiveElementService.
   *
   * @param target - The HTML element that triggered the focus event.
   */
  @HostListener('focus', ['$event.target'])
  onFocus(target: HTMLSelectElement): void {
    this.interactiveElementService.focus(target.value);
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   *
   * @param target - The HTML element that triggered the blur event.
   */
  @HostListener('blur', ['$event.target'])
  onBlur(target: HTMLSelectElement): void {
    console.log('🚀 ~ CategorySelectDirective ~ onBlur ~ target:', target);
    this.interactiveElementService.blur(target.value);
  }

  /**
   * Handles the input event of the interactive element.
   * When the value of the element changes, the new value is tracked by the FormService.
   *
   * @param event - The input event triggered by the element.
   */
  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    this.formService.trackChange(event);

    const categorySelector = event.target as HTMLSelectElement;
    const category = categorySelector.value;
    const tableRow = categorySelector.closest('tr')!;

    const exerciseNameSelectors = this.exerciseTableRowService.getAllExerciseCategorySelectorsByElement(
      event.target as HTMLSelectElement,
    );

    this.updateCategoryStyles(
      categorySelector,
      category,
      exerciseNameSelectors,
      this.exerciseDataService.getExerciseCategories(),
    );

    this.updateInputValues(tableRow, category, this.exerciseDataService.getDefaultRepSchemeByCategory());

    if (category === '- Bitte Auswählen -') {
      this.fillCategoryGaps(tableRow);
    }
  }

  /**
   * Updates the styles of category and exercise name selectors.
   * @param target The HTML select element.
   * @param category The selected category value.
   * @param exerciseNameSelectors List of exercise name selectors in the row.
   * @param exerciseCategories Array of exercise categories.
   */
  private updateCategoryStyles(
    categorySelect: HTMLSelectElement,
    category: string,
    exerciseNameSelectors: NodeListOf<HTMLSelectElement>,
    exerciseCategories: string[],
  ): void {
    if (category === '- Bitte Auswählen -') {
      this.renderer.setStyle(categorySelect, 'opacity', '0');
      exerciseNameSelectors.forEach((selector) => {
        this.renderer.setStyle(selector, 'display', 'none');
        selector.disabled = false;
      });
    } else {
      this.renderer.setStyle(categorySelect, 'opacity', '1');
      const index = exerciseCategories.indexOf(category);
      exerciseNameSelectors.forEach((selector, i) => {
        this.renderer.setStyle(selector, 'display', i === index ? 'block' : 'none');
        this.renderer.setStyle(selector, 'opacity', i === index ? '1' : '0');
        selector.disabled = i !== index;
      });
    }
  }

  /**
   * Updates the input values in the form based on the selected category.
   * @param tableRow The current table row element.
   * @param category The selected category value.
   * @param defaultRepSchemeByCategory Default rep scheme values by category.
   */
  private updateInputValues(
    tableRow: Element,
    category: string,
    defaultRepSchemeByCategory: RepSchemeByCategory,
  ): void {
    const exerciseNameSelectors = tableRow.querySelectorAll('.exercise-name-selector') as NodeListOf<HTMLSelectElement>;

    // Finde den ersten sichtbaren und nicht deaktivierten selector
    const exerciseSelect = Array.from(exerciseNameSelectors).find(
      (selector) => window.getComputedStyle(selector).opacity === '1' && !selector.disabled,
    )!;

    const setsInput = tableRow.querySelector('.sets') as HTMLInputElement;
    const repsInput = tableRow.querySelector('.reps') as HTMLInputElement;
    const targetRPEInput = tableRow.querySelector('.targetRPE') as HTMLInputElement;
    const weightInput = tableRow.querySelector('.weight') as HTMLInputElement;
    const rpeInput = tableRow.querySelector('.actualRPE') as HTMLInputElement;
    const estMaxInput = tableRow.querySelector('.estMax') as HTMLInputElement;

    if (category !== '- Bitte Auswählen -') {
      const defaultValues = defaultRepSchemeByCategory[category];
      if (defaultValues) {
        setsInput.value = defaultValues.defaultSets.toString();
        repsInput.value = defaultValues.defaultReps.toString();
        targetRPEInput.value = defaultValues.defaultRPE.toString();
      }
    } else {
      this.resetInputs(exerciseSelect, setsInput, repsInput, targetRPEInput, weightInput, rpeInput, estMaxInput);
    }

    this.updateFormService(exerciseSelect, setsInput, repsInput, targetRPEInput, weightInput, rpeInput, estMaxInput);
  }

  /**
   * Resets the input values to default.
   * @param exerciseSelect The exercise name selector.
   * @param setsInput The sets input field.
   * @param repsInput The reps input field.
   * @param targetRPEInput The target RPE input field.
   */
  private resetInputs(
    exerciseSelect: HTMLSelectElement,
    setsInput: HTMLInputElement,
    repsInput: HTMLInputElement,
    targetRPEInput: HTMLInputElement,
    weightInput: HTMLInputElement,
    rpeInput: HTMLInputElement,
    estMaxInput: HTMLInputElement,
  ): void {
    exerciseSelect.value = '';
    setsInput.value = '';
    repsInput.value = '';
    targetRPEInput.value = '';
    weightInput.value = '';
    rpeInput.value = '';
    estMaxInput.value = '';
  }

  /**
   * Updates the form service with the current values of the input fields.
   * @param exerciseSelect The exercise name selector.
   * @param setsInput The sets input field.
   * @param repsInput The reps input field.
   * @param targetRPEInput The target RPE input field.
   */
  private updateFormService(
    exerciseSelect: HTMLSelectElement,
    setsInput: HTMLInputElement,
    repsInput: HTMLInputElement,
    targetRPEInput: HTMLInputElement,
    weightInput: HTMLInputElement,
    rpeInput: HTMLInputElement,
    estMaxInput: HTMLInputElement,
  ): void {
    this.formService.addChange(exerciseSelect.name, exerciseSelect.value);
    this.formService.addChange(setsInput.name, setsInput.value);
    this.formService.addChange(repsInput.name, repsInput.value);
    this.formService.addChange(targetRPEInput.name, targetRPEInput.value);
    this.formService.addChange(weightInput.name, weightInput.value); // Added weightInput
    this.formService.addChange(rpeInput.name, rpeInput.value); // Added rpeInput
    this.formService.addChange(estMaxInput.name, estMaxInput.value);
  }

  /**
   * Fills the category gaps by copying valid values from subsequent rows.
   * @param tableRow The current table row element.
   */
  private fillCategoryGaps(tableRow: Element): void {
    let nextRow = tableRow.nextElementSibling;

    while (nextRow) {
      const nextCategorySelector = nextRow.querySelector('.exercise-category-selector') as HTMLSelectElement;

      if (
        nextCategorySelector &&
        nextCategorySelector.value !== '- Bitte Auswählen -' &&
        nextCategorySelector.value !== ''
      ) {
        this.copyValuesToPreviousRow(tableRow, nextRow);
        break;
      }

      nextRow = nextRow.nextElementSibling;
    }
  }

  /**
   * Copies values from the next row to the current row.
   * @param currentRow The current table row element.
   * @param nextRow The next table row element.
   */
  private copyValuesToPreviousRow(currentRow: Element, nextRow: Element): void {
    const exerciseCategorySelector = currentRow.querySelector('.exercise-category-selector') as HTMLSelectElement;
    const nextCategorySelector = nextRow.querySelector('.exercise-category-selector') as HTMLSelectElement;

    if (exerciseCategorySelector && nextCategorySelector) {
      const currentInputs = this.getInputElements(currentRow);
      const nextInputs = this.getInputElements(nextRow);

      exerciseCategorySelector.value = nextCategorySelector.value;
      exerciseCategorySelector.dispatchEvent(new Event('change'));

      this.copyInputValues(currentInputs, nextInputs);
      this.updateFormServiceWithInputElements(exerciseCategorySelector, currentInputs);

      this.resetNextRowValues(nextCategorySelector, nextInputs);
    }
  }

  /**
   * Gets the input elements from a table row.
   * @param row The table row element.
   * @returns An object containing the input elements.
   */
  private getInputElements(row: Element) {
    return {
      exerciseNameSelect: row.querySelector('.exercise-name-selector') as HTMLSelectElement,
      setsInput: row.querySelector('.sets') as HTMLInputElement,
      repsInput: row.querySelector('.reps') as HTMLInputElement,
      targetRPEInput: row.querySelector('.targetRPE') as HTMLInputElement,
      weightInput: row.querySelector('.weight') as HTMLInputElement,
      actualRPEInput: row.querySelector('.actualRPE') as HTMLInputElement,
      estMaxInput: row.querySelector('.estMax') as HTMLInputElement,
    };
  }

  /**
   * Copies values from one set of input elements to another.
   * @param currentInputs The current row's input elements.
   * @param nextInputs The next row's input elements.
   */
  private copyInputValues(currentInputs: any, nextInputs: any): void {
    for (const key in currentInputs) {
      if (currentInputs.hasOwnProperty(key) && nextInputs.hasOwnProperty(key)) {
        currentInputs[key].value = nextInputs[key].value;
      }
    }
  }

  /**
   * Updates the form service with the current values of the input elements.
   * @param categorySelector The category selector.
   * @param inputs The input elements.
   */
  private updateFormServiceWithInputElements(categorySelector: HTMLSelectElement, inputs: any): void {
    this.formService.addChange(categorySelector.name, categorySelector.value);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        this.formService.addChange(inputs[key].name, inputs[key].value);
      }
    }
  }

  /**
   * Resets the values of the next row's input elements.
   * @param categorySelector The category selector of the next row.
   * @param inputs The input elements of the next row.
   */
  private resetNextRowValues(categorySelector: HTMLSelectElement, inputs: any): void {
    categorySelector.value = '- Bitte Auswählen -';
    categorySelector.dispatchEvent(new Event('change'));

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        inputs[key].value = '';
        this.formService.addChange(inputs[key].name, inputs[key].value);
      }
    }
  }
}
