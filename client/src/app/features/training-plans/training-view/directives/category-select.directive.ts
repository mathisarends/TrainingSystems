import { Directive, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementDirective } from '../../../../shared/directives/interactive-element.directive';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { ExerciseDataService } from '../exercise-data.service';
import { RepSchemeByCategory } from '../models/default-rep-scheme-by-category';
import { ExerciseInputs } from '../models/exercise-inputs';
import { ExerciseTableRowService } from '../services/exercise-table-row.service';

/**
 * Directive that handles the selection of exercise categories and updates related inputs
 * in a row of the exercise table based on the selected category.
 */
@Directive({
  selector: '[category-select]',
  standalone: true,
})
export class CategorySelectDirective extends InteractiveElementDirective {
  /**
   * Constant representing the placeholder category option.
   * Used to identify when no actual category is selected.
   */
  private readonly PLACEHOLDER_CATEGORY = '- Bitte Auswählen -';

  constructor(
    protected override autoSaveService: AutoSaveService,
    protected override formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
    private exerciseDataService: ExerciseDataService,
  ) {
    super(autoSaveService, formService);
  }

  /**
   * Tracks changes to the category selection and updates the input fields accordingly.
   */
  @HostListener('change', ['$event'])
  override onChange(event: Event): void {
    const categorySelector = event.target as HTMLSelectElement;
    this.updateInputValues(categorySelector, this.exerciseDataService.getDefaultRepSchemeByCategory());

    super.onChange(event);
  }

  /**
   * Updates the input fields (sets, reps, target RPE) based on the selected category.
   * If the placeholder category is selected, resets the input fields.
   */
  private updateInputValues(
    categorySelector: HTMLSelectElement,
    defaultRepSchemeByCategory: RepSchemeByCategory,
  ): void {
    const { exerciseSelect, setsInput, repsInput, targetRPEInput } =
      this.exerciseTableRowService.getInputsByElement(categorySelector);

    const category = categorySelector.value;

    if (this.isPlaceholderCategory(category)) {
      this.resetAndUpdateForm(categorySelector);
      return;
    }

    const defaultValues = defaultRepSchemeByCategory[category];
    setsInput.value = defaultValues.defaultSets.toString();
    repsInput.value = defaultValues.defaultReps.toString();
    targetRPEInput.value = defaultValues.defaultRPE.toString();

    this.updateFormService(exerciseSelect);
  }

  /**
   * Resets the input fields and updates the form state for a specific exercise.
   */
  private resetAndUpdateForm(exerciseSelect: HTMLSelectElement): void {
    this.resetInputs(exerciseSelect);
    this.updateFormService(exerciseSelect);
  }

  /**
   * Resets the values of input fields related to the selected exercise.
   */
  private resetInputs(exerciseSelect: HTMLSelectElement): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByElement(exerciseSelect);
    console.log('🚀 ~ CategorySelectDirective ~ resetInputs ~ inputs:', inputs);

    this.forEachInput(inputs, (input) => (input.value = ''));
  }

  /**
   * Updates the form state by adding changes for each input element in the exercise row.
   */
  private updateFormService(exerciseSelect: HTMLSelectElement): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByElement(exerciseSelect);
    this.forEachInput(inputs, (input) => this.formService.addChange(input.name, input.value));
  }

  /**
   * Iterates over each input field related to the exercise and applies a callback function.
   */
  private forEachInput(inputs: ExerciseInputs, callback: (input: HTMLInputElement | HTMLSelectElement) => void): void {
    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const inputElement = inputs[key as keyof ExerciseInputs];
        callback(inputElement);
      }
    }
  }

  /**
   * Checks if the selected category is the placeholder category.
   */
  private isPlaceholderCategory(category: string): boolean {
    return category === this.PLACEHOLDER_CATEGORY;
  }
}
