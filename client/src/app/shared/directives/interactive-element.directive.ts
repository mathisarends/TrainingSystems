import { Directive, HostListener, Input } from '@angular/core';
import { FormService } from '../../core/form.service';
import { InteractiveElementService } from '../service/interactive-element.service';
import { InteractiveElement } from '../types/interactive-element.types';

/**
 * Directive to handle interactive form elements by tracking focus, blur, and input events.
 * This directive automatically manages changes through the FormService and tracks element states via the InteractiveElementService.
 */
@Directive({
  selector: '[appInteractiveElement]',
  standalone: true,
})
export class InteractiveElementDirective {
  /**
   * Attribute binding for the directive. This is where you can pass additional configuration if needed.
   */
  @Input() appInteractiveElement!: string;

  constructor(
    protected interactiveElementService: InteractiveElementService,
    protected formService: FormService,
  ) {}

  /**
   * Handles the focus event of the interactive element.
   * When the element gains focus, its value is stored by the InteractiveElementService.
   *
   * @param target - The HTML element that triggered the focus event.
   */
  @HostListener('focus', ['$event.target'])
  onFocus(interactiveElement: InteractiveElement): void {
    this.interactiveElementService.focus(interactiveElement.value);
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   *
   * @param target - The HTML element that triggered the blur event.
   */
  @HostListener('blur', ['$event.target'])
  onBlur(interactiveElement: InteractiveElement): void {
    if (!(interactiveElement instanceof HTMLSelectElement)) {
      this.interactiveElementService.triggerChangeIfModified(interactiveElement.value);
    }
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

    if (event.target instanceof HTMLSelectElement) {
      this.interactiveElementService.triggerChangeIfModified(event.target.value);
    }
  }
}