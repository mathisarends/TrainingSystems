import { Directive, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementDirective } from '../../../../shared/directives/interactive-element.directive';
import { InteractiveElementService } from '../../../../shared/service/interactive-element.service';
import { InteractiveElement } from '../../../../shared/types/interactive-element.types';
import { EstMaxService } from '../services/estmax.service';

/**
 * Extended directive that adds new functionality on top of InteractiveElementDirective.
 * Inherits basic event handling (focus, blur, input) and adds more functionality.
 */
@Directive({
  selector: '[repInputDirective]',
  standalone: true,
})
export class RepInputDirective extends InteractiveElementDirective {
  constructor(
    protected override interactiveElementService: InteractiveElementService,
    protected override formService: FormService,
    private estMaxService: EstMaxService,
  ) {
    super(interactiveElementService, formService);
  }

  @HostListener('change', ['$event.target'])
  override onFocus(interactiveElement: InteractiveElement): void {
    super.onFocus(interactiveElement);

    this.estMaxService.calculateMaxAfterInputChange(interactiveElement as HTMLInputElement);
  }
}
