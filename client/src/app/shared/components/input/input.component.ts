import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RepInputDirective } from '../../../features/training-plans/training-view/directives/rep-input.directive';
import { RpeInputDirective } from '../../../features/training-plans/training-view/directives/rpe-input.directive';
import { WeightInputDirective } from '../../../features/training-plans/training-view/directives/weight-input.directive';
import { InteractiveElementDirective } from '../../directives/interactive-element.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, InteractiveElementDirective, WeightInputDirective, RpeInputDirective, RepInputDirective, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent<T extends string | number> {
  /**
   * The name of the input field, used to uniquely identify the control.
   * This input is required and must be provided by the parent component.
   */
  name = input.required<string>();

  /**
   * The type of input control (e.g., 'text', 'number', 'password').
   * This input is required and determines the type of input field.
   */
  type = input.required<'text' | 'number' | 'tel'>();

  /**
   * The placeholder of the input.
   */
  placeholder = input<string>('');

  /**
   * The value of the input field. Can be either a string or a number.
   * This input is required and reflects the current value of the input field.
   */
  value = model<T>();

  /**
   * Determines how the text within the input field is aligned.
   * This input is optional, with a default value of 'center' if not provided.
   */
  alignText = input<'left' | 'center'>('center');

  /**
   * Selects which directive to use on the input field.
   * Possible values are:
   * - 'interactiveElementDirective': Adds interactivity behavior.
   * - 'weightInputDirective': Adds weight input specific behavior.
   * By default, the 'interactiveElementDirective' is applied.
   */
  directiveUsed = input<
    'interactiveElementDirective' | 'weightInputDirective' | 'rpeInputDirective' | 'repInputDirective'
  >('interactiveElementDirective');


}
