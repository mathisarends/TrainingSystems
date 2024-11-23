import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInputComponent<T extends string | number> implements AfterViewInit {
  private inputElement = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  /**
   * A unique identifier for the input field.
   * Used to associate the label and input element.
   */
  protected readonly fieldId: string = `form-input-${Math.random().toString(36)}`;

  /**
   * The label displayed above the input field.
   */
  label = input<string>('');

  /**
   * The type of the input field (e.g., 'text' or 'number').
   */
  type = input<'text' | 'number'>('text');

  /**
   * Placeholder text displayed inside the input field.
   */
  placeholder = input<string>('');

  /**
   * A signal representing the current value of the input field.
   * Supports both string and number types based on generic type `T`.
   */
  value = model<T | ''>('' as T | '');

  /**
   * Indicates whether the input field is required.
   */
  required = input(false);

  /**
   * A regex pattern to validate the input value.
   */
  validationPattern = input<string | undefined>(undefined);

  /**
   * The error message displayed when validation fails.
   */
  validationErrorMessage = input<string>('');

  /**
   * Tracks whether the input field currently has focus.
   */
  isFocused = signal(false);

  /**
   * Tracks whether the input field has been interacted with.
   */
  isTouched = signal(false);

  /**
   * Determines wether the input is focused at first render.
   */
  focus = input(false);

  /**
   * Computes the validity of the input field based on the following:
   * - If the field has not been touched, it is considered valid (initial state).
   * - After being touched, validity depends on:
   *   1. Whether the input is required.
   *   2. Whether the value matches the provided validation pattern.
   */
  isValid = computed(() => {
    if (!this.isTouched()) {
      return true;
    }

    return this.checkRequired() && this.checkValidationPattern();
  });

  constructor() {
    effect(
      () => {
        if (this.value() && !this.isTouched()) {
          this.isTouched.set(true);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngAfterViewInit(): void {
    if (this.focus()) {
      this.setFocus();
    }
  }

  /**
   * Sets focus to the input element.
   */
  private setFocus(): void {
    if (this.inputElement) {
      this.inputElement()!.nativeElement.focus();
      this.isFocused.set(true); // Update the signal
    }
  }

  /**
   * Checks if the required validation passes.
   * Returns true if the field is not required or if it has a non-empty value.
   */
  private checkRequired(): boolean {
    const currentValue = this.value();
    if (this.required() && (currentValue === '' || currentValue === null)) {
      return false;
    }
    return true;
  }

  /**
   * Validates the input value against the provided regex pattern.
   * Returns true if no validation pattern is provided or if the value matches the pattern.
   */
  private checkValidationPattern(): boolean {
    const currentValue = this.value();
    const pattern = this.validationPattern();
    if (!pattern) {
      return true; // No pattern to validate against
    }

    try {
      const regex = new RegExp(pattern);
      if (typeof currentValue === 'string') {
        return regex.test(currentValue);
      }
      if (typeof currentValue === 'number') {
        return regex.test(currentValue.toString());
      }
    } catch (error) {
      console.error('Invalid regex pattern:', error);
    }

    return false;
  }

  /**
   * Handles the `focusin` event when the input field gains focus.
   * Sets `isFocused` to true and marks the field as `isTouched`.
   */
  @HostListener('focusin')
  onFocusIn(): void {
    this.isFocused.set(true);
  }

  /**
   * Handles the `focusout` event when the input field loses focus.
   * Sets `isFocused` to false.
   */
  @HostListener('focusout')
  onFocusOut(): void {
    this.isFocused.set(false);
  }
}