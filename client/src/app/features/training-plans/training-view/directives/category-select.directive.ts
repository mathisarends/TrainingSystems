import { Directive, HostListener, Renderer2, RendererFactory2 } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementService } from '../../../../shared/service/interactive-element.service';
import { ExerciseDataService } from '../exercise-data.service';
import { RepSchemeByCategory } from '../models/default-rep-scheme-by-category';
import { ExerciseInputs } from '../models/exercise-inputs';
import { ExerciseTableRowService } from '../services/exercise-table-row.service';

@Directive({
  selector: '[category-select]',
  standalone: true,
})
export class CategorySelectDirective {
  private readonly PLACEHOLDER_CATEGROY = '- Bitte Auswählen -';

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

    if (category === this.PLACEHOLDER_CATEGROY) {
      this.updateInputValues(
        categorySelector,
        this.PLACEHOLDER_CATEGROY,
        this.exerciseDataService.getDefaultRepSchemeByCategory(),
      );
    } else {
      this.updateInputValues(categorySelector, category, this.exerciseDataService.getDefaultRepSchemeByCategory());
    }

    this.interactiveElementService.triggerChangeIfModified(categorySelector.value);
  }

  private updateInputValues(
    categorySelector: HTMLSelectElement,
    category: string,
    defaultRepSchemeByCategory: RepSchemeByCategory,
  ): void {
    const { exerciseSelect, setsInput, repsInput, targetRPEInput } =
      this.exerciseTableRowService.getInputsByCategorySelector(categorySelector);

    // Get the computed style of the exerciseSelect element
    const computedStyles = window.getComputedStyle(exerciseSelect).display;
    console.log('🚀 ~ CategorySelectDirective ~ computedStyles:', computedStyles);

    if (category !== this.PLACEHOLDER_CATEGROY) {
      const defaultValues = defaultRepSchemeByCategory[category];
      exerciseSelect.value = exerciseSelect.options[0]?.value;
      setsInput.value = defaultValues.defaultSets.toString();
      repsInput.value = defaultValues.defaultReps.toString();
      targetRPEInput.value = defaultValues.defaultRPE.toString();
    } else {
      this.resetInputs(exerciseSelect);
      this.updateFormService(exerciseSelect);
      return;
    }

    this.updateFormService(exerciseSelect);
  }

  private resetInputs(exerciseSelect: HTMLSelectElement): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByCategorySelector(exerciseSelect);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const element = inputs[key as keyof ExerciseInputs];
        element.value = '';
      }
    }
  }

  private updateFormService(exerciseSelect: HTMLSelectElement): void {
    const inputs: ExerciseInputs = this.exerciseTableRowService.getInputsByCategorySelector(exerciseSelect);

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const element = inputs[key as keyof ExerciseInputs];
        this.formService.addChange(element.name, element.value);
      }
    }
  }
}
