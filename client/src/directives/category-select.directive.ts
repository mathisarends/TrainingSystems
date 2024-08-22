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

  @HostListener('focus', ['$event.target'])
  onFocus(target: HTMLSelectElement): void {
    this.interactiveElementService.focus(target.value);
  }

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    this.formService.trackChange(event);

    const categorySelector = event.target as HTMLSelectElement;
    const category = categorySelector.value;
    const tableRow = categorySelector.closest('tr')!;

    const exerciseNameSelectors =
      this.exerciseTableRowService.getAllExerciseCategorySelectorsByElement(categorySelector);

    if (category === '- Bitte Auswählen -') {
      this.handlePlaceholderCategory(categorySelector, exerciseNameSelectors, tableRow);
    } else {
      this.handleSelectedCategory(categorySelector, exerciseNameSelectors, tableRow, category);
    }

    this.interactiveElementService.blur(categorySelector.value);
  }

  /**
   * Handles the logic when the category is "- Bitte Auswählen -".
   */
  private handlePlaceholderCategory(
    categorySelector: HTMLSelectElement,
    exerciseNameSelectors: NodeListOf<HTMLSelectElement>,
    tableRow: Element,
  ): void {
    // Hide the category selector and reset exercise name selectors
    this.renderer.setStyle(categorySelector, 'opacity', '0');
    exerciseNameSelectors.forEach((selector) => {
      this.renderer.setStyle(selector, 'display', 'none');
      selector.disabled = false;
    });

    // Reset the input values
    this.updateInputValues(tableRow, '- Bitte Auswählen -', this.exerciseDataService.getDefaultRepSchemeByCategory());

    // Fill category gaps from subsequent rows
    this.fillCategoryGaps(tableRow);
  }

  /**
   * Handles the logic when a specific category is selected.
   */
  private handleSelectedCategory(
    categorySelector: HTMLSelectElement,
    exerciseNameSelectors: NodeListOf<HTMLSelectElement>,
    tableRow: Element,
    category: string,
  ): void {
    // Show the category selector
    this.renderer.setStyle(categorySelector, 'opacity', '1');

    // Determine the index of the selected category and update selectors visibility
    const selectedCategoryIndex = this.getSelectedCategoryIndex(category);
    exerciseNameSelectors.forEach((selector, index) => {
      const isSelected = index === selectedCategoryIndex;
      this.setSelectorVisibility(selector, isSelected);
    });

    // Update the input values based on the selected category
    this.updateInputValues(tableRow, category, this.exerciseDataService.getDefaultRepSchemeByCategory());
  }

  private getSelectedCategoryIndex(category: string): number {
    return this.exerciseDataService.getExerciseCategories().indexOf(category);
  }

  private setSelectorVisibility(selector: HTMLSelectElement, isVisible: boolean): void {
    this.renderer.setStyle(selector, 'display', isVisible ? 'block' : 'none');
    this.renderer.setStyle(selector, 'opacity', isVisible ? '1' : '0');
    selector.disabled = !isVisible;
  }

  private updateInputValues(
    tableRow: Element,
    category: string,
    defaultRepSchemeByCategory: RepSchemeByCategory,
  ): void {
    const exerciseNameSelectors = tableRow.querySelectorAll('.exercise-name-selector') as NodeListOf<HTMLSelectElement>;

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
      this.resetInputs(exerciseSelect);
    }

    this.updateFormService(exerciseSelect);
  }

  private resetInputs(exerciseSelect: HTMLSelectElement): void {
    const inputs = this.exerciseTableRowService.getInputsByCategorySelector(exerciseSelect, true);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const element = inputs[key as keyof typeof inputs];
        element.value = '';
      }
    }
  }

  private updateFormService(exerciseSelect: HTMLSelectElement): void {
    const inputs = this.exerciseTableRowService.getInputsByCategorySelector(exerciseSelect);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const element = inputs[key as keyof typeof inputs];
        this.formService.addChange(element.name, element.value);
      }
    }
  }

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

  private copyInputValues(currentInputs: any, nextInputs: any): void {
    for (const key in currentInputs) {
      if (currentInputs.hasOwnProperty(key) && nextInputs.hasOwnProperty(key)) {
        currentInputs[key].value = nextInputs[key].value;
      }
    }
  }

  private updateFormServiceWithInputElements(categorySelector: HTMLSelectElement, inputs: any): void {
    this.formService.addChange(categorySelector.name, categorySelector.value);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        this.formService.addChange(inputs[key].name, inputs[key].value);
      }
    }
  }

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
