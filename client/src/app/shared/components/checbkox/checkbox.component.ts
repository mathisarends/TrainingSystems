import { Component, effect, HostListener, input, output, signal } from '@angular/core';
import { CheckboxItem } from './checkbox-item';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  /**
   * Input signal for the CheckboxItem object that contains the label and checked state.
   */
  item = input<CheckboxItem>();

  /**
   * Holds the label of the checkbox.
   */
  label = signal('');

  /**
   * Signal that holds the checked state of the checkbox.
   * Initialized based on the input CheckboxItem.
   */
  isChecked = signal(false);

  /**
   * Output event emitter that emits the updated CheckboxItem whenever the checkbox state changes.
   */
  valueChanged = output<CheckboxItem>();

  /**
   * Initializes the component by creating an effect that synchronizes the `CheckboxItem`
   * input with the internal label and checked signals.
   */
  constructor() {
    effect(
      () => {
        const item = this.item();
        if (item) {
          this.label.set(item.label);
          this.isChecked.set(item.isChecked);
        }
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Toggles the checkbox state and emits the updated CheckboxItem
   * with the new label and checked state.
   */
  toggleCheckbox() {
    const newValue = !this.isChecked();
    this.isChecked.set(newValue);
    this.valueChanged.emit({
      label: this.label(),
      isChecked: newValue,
    });
  }

  /**
   * When the host is clicked, it triggers the `toggleCheckbox()` function
   * to toggle the checkbox state.
   */
  @HostListener('click')
  onHostClick() {
    this.toggleCheckbox();
  }
}
