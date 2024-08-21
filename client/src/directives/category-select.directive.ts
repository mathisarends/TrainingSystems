import { Directive, HostListener } from '@angular/core';
import { InteractiveElementService } from '../service/util/interactive-element.service';
import { FormService } from '../service/form/form.service';
import { ExerciseTableRowService } from '../service/training/exercise-table-row.service';
import { log } from 'console';

@Directive({
  selector: '[category-select]',
  standalone: true,
})
export class CategorySelectDirective {
  constructor(
    protected interactiveElementService: InteractiveElementService,
    protected formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
  ) {}

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
    console.log('test');
    this.formService.trackChange(event);

    const exerciseNameSelectors = this.exerciseTableRowService.getAllExerciseCategorySelectorsByElement(
      event.target as HTMLSelectElement,
    );
    console.log('🚀 ~ CategorySelectDirective ~ onInputChange ~ exerciseNameSelectors:', exerciseNameSelectors);
  }
}
