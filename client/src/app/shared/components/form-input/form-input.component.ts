import { ChangeDetectionStrategy, Component, computed, HostListener, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInputComponent<T extends string | number> {
  /**
   * The label for the input field.
   */
  label = input<string>('');

  /**
   * Placeholder text for the input field.
   */
  placeholder = input<string>('');

  /**
   * Signal for the current value of the input.
   * Allows string or number based on generic type `T`.
   */
  value = model<T | ''>('' as T | '');

  required = input(false);

  /**
   * Validation pattern to validate the input value.
   */
  validationPattern = input<string | undefined>(undefined);

  /**
   * Signal for whether the input is currently focused.
   */
  isFocused = signal(false);

  /**
   * Computes the input validity based on `required` and `validationPattern`.
   */
  isValid = computed(() => {
    const currentValue = this.value();
    if (this.required() && (currentValue === '' || currentValue === null)) {
      return false;
    }

    if (typeof currentValue === 'string' && this.validationPattern()) {
      try {
        const regex = new RegExp(this.validationPattern()!);
        return regex.test(currentValue);
      } catch (error) {
        console.error('Invalid regex pattern:', error);
        return false;
      }
    }

    if (typeof currentValue === 'number') {
      // If a validation pattern is present, convert the number to a string for pattern matching.
      if (this.validationPattern()) {
        try {
          const regex = new RegExp(this.validationPattern()!);
          return regex.test(currentValue.toString());
        } catch (error) {
          console.error('Invalid regex pattern:', error);
          return false;
        }
      }
    }

    return true;
  });

  /**
   * Gets an error message for invalid input.
   */
  getErrorMessage(): string {
    const currentValue = this.value();
    if (this.required() && (currentValue === '' || currentValue === null)) {
      return 'This field is required.';
    }

    if (typeof currentValue === 'string' && this.validationPattern()) {
      try {
        const regex = new RegExp(this.validationPattern()!);
        if (!regex.test(currentValue)) {
          return 'Invalid input format.';
        }
      } catch (error) {
        return 'Invalid validation pattern.';
      }
    }

    if (typeof currentValue === 'number') {
      if (this.validationPattern()) {
        try {
          const regex = new RegExp(this.validationPattern()!);
          if (!regex.test(currentValue.toString())) {
            return 'Invalid number format.';
          }
        } catch (error) {
          return 'Invalid validation pattern.';
        }
      }
    }

    return '';
  }

  /**
   * Handles focus event using HostListener.
   * Sets the `isFocused` signal to true when the input gains focus.
   */
  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    this.isFocused.set(true);
  }

  /**
   * Handles blur event using HostListener.
   * Sets the `isFocused` signal to false when the input loses focus.
   */
  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    this.isFocused.set(false);
  }
}
