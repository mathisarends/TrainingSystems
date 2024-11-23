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
  protected readonly fieldId: string = `form-input-${Math.random().toString(36)}`;

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

  validationErrorMessage = input('');

  /**
   * Signal for whether the input is currently focused.
   */
  isFocused = signal(false);

  isTouched = signal(false);

  /**
   * Computes the input validity based on `required` and `validationPattern`.
   */
  isValid = computed(() => {
    const currentValue = this.value();

    if (!this.isTouched()) {
      return true;
    }

    if (this.required() && (currentValue === '' || currentValue === null)) {
      return false;
    }

    if (typeof currentValue === 'string' && this.validationPattern()) {
      try {
        const regex = new RegExp(this.validationPattern()!);
        return regex.test(currentValue);
      } catch (error) {
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
   * Handles focus event using HostListener.
   * Sets the `isFocused` signal to true when the input gains focus.
   */
  @HostListener('focusin')
  onFocusIn(): void {
    this.isFocused.set(true);
    this.isTouched.set(true);
  }

  /**
   * Handles blur event using HostListener.
   * Sets the `isFocused` signal to false when the input loses focus.
   */
  @HostListener('focusout')
  onFocusOut(): void {
    this.isFocused.set(false);
  }
}
