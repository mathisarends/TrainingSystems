import { Directive, HostListener } from '@angular/core';
import { FormService } from '../../../../core/services/form.service';
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
export class CategorySelectDirective {
  /**
   * Constant representing the placeholder category option.
   * Used to identify when no actual category is selected.
   */
  private readonly PLACEHOLDER_CATEGORY = '- Bitte Auswählen -';

  constructor(
    private autoSaveService: AutoSaveService,
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
    private exerciseDataService: ExerciseDataService,
  ) {}

  /**
   * Tracks changes to the category selection and updates the input fields accordingly.
   */
  @HostListener('change', ['$event'])
  async onChange(event: Event): Promise<void> {
    const categorySelector = event.target as HTMLSelectElement;
    await this.updateInputValues(categorySelector, this.exerciseDataService.defaultRepSchemeByCategory());
  }

  /**
   * Updates the input fields (sets, reps, target RPE) based on the selected category.
   * If the placeholder category is selected, resets the input fields.
   */
  private async updateInputValues(
    categorySelector: HTMLSelectElement,
    defaultRepSchemeByCategory: RepSchemeByCategory,
  ): Promise<void> {
    console.log('updateInputValues');
    const category = categorySelector.value;

    if (this.isPlaceholderCategory(category)) {
      this.resetAndUpdateForm(categorySelector);
      this.autoSaveService.save('reload');
      return;
    }

    await this.setDefaultValuesForCategory(categorySelector, defaultRepSchemeByCategory);

    this.updateFormService(categorySelector);
    this.autoSaveService.save();
  }

  /**
   * Sets default values for the input fields (sets, reps, RPE, etc.) based on the selected exercise category.
   * Resets other fields like weight, RPE, estimated max, and notes to empty values.
   */
  private async setDefaultValuesForCategory(
    categorySelector: HTMLSelectElement,
    defaultRepSchemeByCategory: RepSchemeByCategory,
  ) {
    const { exerciseSelect, setsInput, repsInput, weightInput, rpeInput, targetRPEInput, estMaxInput, noteInput } =
      this.exerciseTableRowService.getInputsByElement(categorySelector);
    const category = categorySelector.value;

    const firstExerciseOptionForCategory = this.exerciseDataService.categorizedExercises()[categorySelector.value][0];

    const defaultValues = defaultRepSchemeByCategory[category];

    exerciseSelect.value = firstExerciseOptionForCategory;
    setsInput.value = defaultValues.defaultSets.toString();
    repsInput.value = defaultValues.defaultReps.toString();
    weightInput.value = '';
    rpeInput.value = '';
    estMaxInput.value = '';
    noteInput.value = '';
    targetRPEInput.value = defaultValues.defaultRPE.toString();

    await this.waitForDomUpdated();
  }
  private async waitForDomUpdated(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
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

    this.forEachInput(inputs, (input) => (input.value = ''));
  }

  /**
   * Updates the form state by adding changes for each input element in the exercise row.
   */
  private updateFormService(categorySelector: HTMLSelectElement): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByElement(categorySelector);

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
