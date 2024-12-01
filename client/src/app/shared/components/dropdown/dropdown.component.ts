import { Component, input, model, output } from '@angular/core';
import { CategorySelectDirective } from '../../../features/training-plans/training-view/directives/category-select.directive';
import { InteractiveElementDirective } from '../../directives/interactive-element.directive';
import { DetermineSelectOptionValuePipe } from './determine-select-option-value.pipe';

/**
 * A wrapper component for a `<select>` HTML element.
 *
 * The `SelectComponent` provides a fully customizable select dropdown with
 * options passed via inputs, and the ability to emit the selected value upon change.
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [InteractiveElementDirective, CategorySelectDirective, DetermineSelectOptionValuePipe],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
  /**
   * The name of the select input, used to uniquely identify the control.
   * This input is required and must be provided by the parent component.
   */
  name = input<string>();

  /**
   * The currently selected value for the select dropdown.
   * This input is required and is used to indicate which option should be selected by default.
   */
  selectedValue = model.required<string | number>();

  /**
   * The list of option that are displayed in the user interface.
   */
  options = input.required<(string | number)[]>();

  /**
   * The list of option values that are emitted.
   * Not required and if not given the options will be used instead.
   */
  optionLabels = input<(string | number)[]>([]);

  /**
   * Selects which directive to use on the select element.
   */
  directiveUsed = input<'interactiveElementDirective' | 'category-select'>('interactiveElementDirective');

  disabled = input(false);

  valueChange = output<string | number>();

  /**
   * Handles the `change` event from the select element.
   * Emits the new selected value through the `selectionChanged` output.
   *
   * @param event - The change event from the select input.
   */
  onChange(event: Event) {
    const newValue = (event.target as HTMLSelectElement).value;
    this.selectedValue.set(newValue);
    this.valueChange.emit(newValue);
  }
}
