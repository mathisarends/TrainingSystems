import { Directive } from '@angular/core';
import { AbstractDoubleClickDirective2 } from './abstract-double-click2.directive';

/**
 * Directive that extends the AbstractDoubleClickDirective
 * to add additional functionality specific to weight input handling.
 */
@Directive({
  selector: '[weightInput]',
  standalone: true,
})
export class WeightInputDirective2 extends AbstractDoubleClickDirective2 {}
