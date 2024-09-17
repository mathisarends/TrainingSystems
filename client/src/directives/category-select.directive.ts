import { Directive, HostListener, Renderer2, RendererFactory2 } from '@angular/core';
import { FormService } from '../app/core/form.service';
import { ExerciseDataService } from '../app/features/training-plans/training-view/exercise-data.service';
import { RepSchemeByCategory } from '../app/features/training-plans/training-view/models/default-rep-scheme-by-category';
import { InteractiveElementService } from '../app/shared/service/interactive-element.service';
import { ExerciseInputs } from '../service/training/exercise-inputs';
import { ExerciseTableRowService } from '../service/training/exercise-table-row.service';

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

    this.interactiveElementService.triggerChangeIfModified(categorySelector.value);
  }

  /**
   * Handles the logic when the category is "- Bitte Auswählen -".
   */
  private handlePlaceholderCategory(
    categorySelector: HTMLSelectElement,
    exerciseNameSelectors: NodeListOf<HTMLSelectElement>,
    tableRow: Element,
  ): void {
    this.renderer.setStyle(categorySelector, 'opacity', '0');
    exerciseNameSelectors.forEach((selector) => {
      this.renderer.setStyle(selector, 'display', 'none');
      selector.disabled = false;
    });

    this.updateInputValues(tableRow, '- Bitte Auswählen -', this.exerciseDataService.getDefaultRepSchemeByCategory());
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
    this.renderer.setStyle(categorySelector, 'opacity', '1');

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
    const exerciseNameSelectorWrappers = Array.from(tableRow.querySelectorAll('.exercise-name-selector'));
    const exerciseNameSelectors = exerciseNameSelectorWrappers.map(
      (wrapper) => wrapper.querySelector('select') as HTMLSelectElement,
    );

    const exerciseSelect = Array.from(exerciseNameSelectors).find(
      (selector) => window.getComputedStyle(selector).opacity === '1' && !selector.disabled,
    )!;

    const appInputWrappers = Array.from(tableRow.querySelectorAll('app-input'));
    const inputElements = appInputWrappers.flatMap((input) => Array.from(input.querySelectorAll('input')));

    // ziemlich fehleranfällig
    const setsInput = inputElements[0];
    const repsInput = inputElements[1];
    const targetRPEInput = inputElements[3];

    if (category !== '- Bitte Auswählen -') {
      const defaultValues = defaultRepSchemeByCategory[category];
      if (defaultValues) {
        setsInput.value = defaultValues.defaultSets.toString();
        repsInput.value = defaultValues.defaultReps.toString();
        targetRPEInput.value = defaultValues.defaultRPE.toString();
      }
    } else {
      this.resetInputs(exerciseSelect);
      this.updateFormService(exerciseSelect, true);
      return;
    }

    this.updateFormService(exerciseSelect, false);
  }

  private resetInputs(exerciseSelect: HTMLSelectElement): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByCategorySelector(exerciseSelect, true);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const element = inputs[key as keyof ExerciseInputs];
        element.value = '';
      }
    }
  }

  private updateFormService(exerciseSelect: HTMLSelectElement, resetMode: boolean): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByCategorySelector(exerciseSelect, resetMode);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const element = inputs[key as keyof ExerciseInputs];
        this.formService.addChange(element.name, element.value);
      }
    }
  }
}
