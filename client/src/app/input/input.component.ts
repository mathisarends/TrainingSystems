import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractiveElementDirective } from '../../directives/interactive-element.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, InteractiveElementDirective],
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
  type = input.required<'text' | 'number'>();

  /**
   * The value of the input field. Can be either a string or a number.
   * This input is required and reflects the current value of the input field.
   */
  value = input.required<T>();

  /**
   * Emits the new value whenever the input field changes.
   * This output is used to inform the parent component when the input value changes.
   */
  valueChange = output<T>();

  /**
   * Determines how the text within the input field is aligned.
   * This input is optional, with a default value of 'center' if not provided.
   */
  alignText = input<'left' | 'center'>('center');

  /**
   * Handles the `change` event from the input element.
   * When the user changes the value in the input field, this method is called.
   * It emits the new value through the `valueChange` signal.
   *
   * @param {Event} event - The change event triggered by the input field.
   */
  onChange(event: Event) {
    const newValue = (event.target as HTMLInputElement).value as unknown as T;
    this.valueChange.emit(newValue);
  }
}
