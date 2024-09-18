import { Directive, HostListener } from '@angular/core';
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
  constructor(
    protected interactiveElementService: InteractiveElementService,
    protected formService: FormService,
  ) {}

  /**
   * Handles the change event of the interactive element.
   * When the value of the element changes and is committed, the new value is tracked.
   *
   * @param event - The change event triggered by the element.
   */
  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    this.formService.trackChange(event);

    const elementValue = (event.target as InteractiveElement).value;
    this.interactiveElementService.triggerChange(elementValue);
  }
}
