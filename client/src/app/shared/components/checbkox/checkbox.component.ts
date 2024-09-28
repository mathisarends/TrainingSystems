import { ChangeDetectionStrategy, Component, HostListener, model, output } from '@angular/core';
import { CheckboxItem } from './checkbox-item';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  /**
   * Input signal for the CheckboxItem object that contains the label and checked state.
   */
  item = model.required<CheckboxItem>();

  valueChanged = output<CheckboxItem>();

  /**
   * When the host is clicked, it triggers the `toggleCheckbox()` function
   * to toggle the checkbox state.
   */
  @HostListener('click')
  toggleCheckbox() {
    const currentState = this.item().isChecked;
    this.item().isChecked = !currentState;

    this.valueChanged.emit(this.item());
  }
}
