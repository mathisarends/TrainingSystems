import { Directive, HostListener, Input } from '@angular/core';
import { InteractiveElementService } from '../service/util/interactive-element.service';
import { FormService } from '../service/form/form.service';

/**
 * Defines the types of elements this directive can be applied to.
 */
type InteractiveElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

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
  onFocus(target: HTMLInputElement | HTMLSelectElement): void {
    this.interactiveElementService.focus(target.value);
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   *
   * @param target - The HTML element that triggered the blur event.
   */
  @HostListener('blur', ['$event.target'])
  onBlur(target: HTMLInputElement | HTMLSelectElement): void {
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

    if (event.target instanceof HTMLSelectElement) {
      this.interactiveElementService.blur(event.target.value);
    }
  }
}
