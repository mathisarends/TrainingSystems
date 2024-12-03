import { Directive, ElementRef, HostListener, signal } from '@angular/core';

@Directive()
export abstract class AbstractDoubleClickHandler {
  /**
   * Delimiter used to split input values.
   * Can be overridden in subclasses.
   */
  protected delimiter: string = ' ';

  /**
   * Stores the timestamp of the last click event for double-click detection.
   */
  protected lastClickTime: number = 0;

  /**
   * Time threshold (in milliseconds) to detect a double-click.
   */
  protected doubleClickThreshold: number = 300;

  /**
   * Indicates whether the input field has been focused by the user.
   * Used to ensure changes are only emitted after user interaction.
   */
  protected focused = signal(false);

  constructor(protected elementRef: ElementRef) {}

  /**
   * Handles double-click events to duplicate the last value or calculate the average.
   */
  @HostListener('click', ['$event'])
  onClick(): void {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - this.lastClickTime;

    if (timeSinceLastClick < this.doubleClickThreshold) {
      this.handleDoubleClick();
    }

    this.lastClickTime = currentTime;
    this.focused.set(true);
  }

  /**
   * Abstract method to be implemented by subclasses for handling double-click logic.
   */
  protected abstract handleDoubleClick(): void;

  /**
   * Parses the input string into an array of numeric values.
   */
  protected parseInputValues(input: string): number[] {
    const cleanedValue = input.replace(/\s+/g, ' ').trim();

    return cleanedValue
      .split(this.delimiter)
      .map((value) => parseFloat(value.trim().replace(',', '.')))
      .filter((value) => !isNaN(value));
  }

  /**
   * Validates and sanitizes the input string.
   */
  protected validateInput(input: string): string {
    return input
      .split(this.delimiter)
      .map((value) => value.trim().replace(',', '.'))
      .filter((value) => !isNaN(parseFloat(value)))
      .join(this.delimiter);
  }

  /**
   * Duplicates the last value in the array by adding it once.
   */
  protected duplicateLastValue(values: number[], setsToFill: number): number[] {
    if (values.length < setsToFill) {
      const lastValue = values[values.length - 1];
      return [...values, lastValue];
    }
    return values;
  }

  /**
   * Calculates the rounded average of the input values using a specified step.
   */
  protected calculateRoundedAverage(values: number[], step: number): number {
    console.log('🚀 ~ AbstractInputHandler ~ calculateRoundedAverage ~ values:', values);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = sum / values.length;
    console.log('🚀 ~ AbstractInputHandler ~ calculateRoundedAverage ~ average:', average);
    return Math.round(average / step) * step;
  }
}
