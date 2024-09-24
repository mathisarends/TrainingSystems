import { Component, input, model, signal } from '@angular/core';

/**
 * A reusable form input component with validation logic.
 * The component provides a floating label, validation support, and dynamic error messaging.
 */
@Component({
  selector: 'app-form-input',
  standalone: true,
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent {
  /**
   * The model that holds the value of the input field.
   * This is a required value, and its type is a string.
   */
  value = model.required<string>();

  /**
   * The label for the input field, passed in as an input property.
   * It is required and will be displayed as floating text above the input when focused or filled.
   */
  label = input.required<string>();

  /**
   * Boolean input that determines whether the input field is required.
   */
  required = input<boolean>(true);

  /**
   * Signal that tracks whether the input is in an invalid state.
   * Set to true if validation fails, false otherwise.
   */
  isInvalid = signal(false);

  /**
   * Holds the error message to display when the input field fails validation.
   */
  errorMessage = signal<string>('');

  /**
   * Handles changes to the input value.
   * This function is triggered whenever the user types in the input field.
   */
  protected onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.validateInput();
  }

  /**
   * Validates the input field based on the `required` property.
   * If the input is required and the value is empty, it marks the field as invalid
   * and sets an appropriate error message. Otherwise, the input is marked as valid.
   */
  private validateInput(): void {
    const value = this.value();

    if (this.required() && !value) {
      this.isInvalid.set(true);
      this.errorMessage.set('This field is required');
      return;
    }

    this.isInvalid.set(false);
    this.errorMessage.set('');
  }
}
