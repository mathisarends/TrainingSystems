import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'form-input',
  standalone: true,
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  imports: [FormsModule],
})
export class FormInputComponent {
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
   */
  value = model<string>('');

  required = input(false);

  /**
   * Validation pattern to validate the input value.
   */
  validationPattern = input<string | undefined>(undefined);

  /**
   * Computes the input validity based on `required` and `validationPattern`.
   */
  isValid = computed(() => {
    if (this.required() && !this.value()) {
      return false;
    }

    if (this.validationPattern()) {
      try {
        const regex = new RegExp(this.validationPattern()!);
        return regex.test(this.value());
      } catch (error) {
        console.error('Invalid regex pattern:', error);
        return false;
      }
    }

    return true;
  });

  /**
   * Gets an error message for invalid input.
   */
  getErrorMessage(): string {
    if (this.required() && !this.value()) {
      return 'This field is required.';
    }

    if (this.validationPattern()) {
      try {
        const regex = new RegExp(this.validationPattern()!);
        if (!regex.test(this.value())) {
          return 'Invalid input format.';
        }
      } catch (error) {
        return 'Invalid validation pattern.';
      }
    }

    return '';
  }
}
