import { Component, input, output } from '@angular/core';
import { InteractiveElementDirective } from '../../directives/interactive-element.directive';

/**
 * A wrapper component for a `<select>` HTML element.
 *
 * The `SelectComponent` provides a fully customizable select dropdown with
 * options passed via inputs, and the ability to emit the selected value upon change.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [InteractiveElementDirective],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  /**
   * The name of the select input, used to uniquely identify the control.
   * This input is required and must be provided by the parent component.
   */
  name = input.required<string>();

  /**
   * The currently selected value for the select dropdown.
   * This input is required and is used to indicate which option should be selected by default.
   */
  selectedValue = input.required<string>();

  /**
   * The list of options to display in the select dropdown.
   * This input can accept an array of strings or numbers and is optional.
   */
  options = input<(string | number)[]>();

  /**
   * Emits the value of the selected option whenever the user changes their selection.
   * This output is a signal-based event emitter that emits the new selected value.
   */
  selectionChanged = output<string>();

  /**
   * Handles the `change` event from the select element.
   * Emits the new selected value through the `selectionChanged` output.
   *
   * @param event - The change event from the select input.
   */
  onChange(event: Event) {
    const newValue = (event.target as HTMLSelectElement).value;
    this.selectionChanged.emit(newValue);
  }
}
