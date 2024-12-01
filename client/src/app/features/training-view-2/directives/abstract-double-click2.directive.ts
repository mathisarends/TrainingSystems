import { AfterViewInit, Directive, ElementRef, HostListener, input } from '@angular/core';

/**
 * Abstract Directive that extends the InteractiveElementDirective
 * with additional functionalities like input element reference and
 * methods to parse and duplicate input values.
 */
@Directive()
export abstract class AbstractDoubleClickDirective2 implements AfterViewInit {
  protected inputElement!: HTMLInputElement;
  protected delimiter: string = ' ';

  /**
   * Stores the timestamp of the last click event.
   * Used to calculate the time difference between clicks for double-click detection.
   */
  protected lastClickTime: number = 0;

  /**
   * Time threshold (in milliseconds) to detect a double-click event.
   * If two clicks occur within this time frame, it is considered a double-click.
   */
  protected doubleClickThreshold: number = 300;

  numberOfSets = input<number>(3);

  constructor(protected elementRef: ElementRef) {}

  /**
   * Lifecycle hook that runs after the view is initialized.
   * It assigns the inner input element inside the wrapper to the inputElement property.
   */
  ngAfterViewInit(): void {
    this.inputElement = this.elementRef.nativeElement;
  }

  /**
   * Handles the single-click event on the input element.
   * Detects if two clicks occur within a threshold time and treats it as a double-click.
   */
  @HostListener('click', ['$event'])
  onClick(): void {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - this.lastClickTime;

    if (timeSinceLastClick < this.doubleClickThreshold) {
      this.handleDoubleClick();
    }

    this.lastClickTime = currentTime;
  }

  /**
   * Shared logic for handling a double-click event.
   * This method is shared between weight and RPE input logic.
   */
  protected handleDoubleClick(): void {
    const inputValues = this.parseInputValues();
    const amountOfSets = this.numberOfSets();
    console.log('🚀 ~ AbstractDoubleClickDirective2 ~ handleDoubleClick ~ amountOfSets:', amountOfSets);

    const isSetLeft = inputValues.length < amountOfSets;
    if (!isSetLeft) {
      return;
    }

    if (this.shouldApplyPlaceholderValue(inputValues)) {
      this.inputElement.value = this.inputElement.placeholder;
    } else if (inputValues.length > 0) {
      this.duplicateLastInput(inputValues);
    }

    // Dismiss the keyboard on mobile devices by removing focus from the input element
    this.inputElement.blur();
    this.inputElement.dispatchEvent(new Event('change'));
  }

  private shouldApplyPlaceholderValue(parsedInputValues: number[]): boolean {
    return parsedInputValues.length === 0 && !!this.inputElement.placeholder;
  }

  protected getRoundedAverageWithStep(roundingStep: number): number {
    const inputValues = this.parseInputValues();

    const average = inputValues.reduce((acc, curr) => acc + curr, 0) / inputValues.length;

    return Math.round(average / roundingStep) * roundingStep;
  }

  protected isLastSet(): boolean {
    const inputValues = this.parseInputValues();

    return inputValues.length === this.numberOfSets();
  }

  /**
   * Parses the input values entered in the input field.
   * The values are expected to be separated by semicolons (';') and may include commas (',') which are replaced with dots ('.') for parsing.
   */
  protected parseInputValues(): number[] {
    const cleanedValue = this.inputElement.value.replace(/\s+/g, ' ').trim();

    const parsedNumericValues = cleanedValue
      .split(this.delimiter)
      .map((value) => parseFloat(value.trim().replace(',', '.')));

    if (parsedNumericValues.some((value) => isNaN(value))) {
      return [];
    }

    return parsedNumericValues;
  }

  /**
   * Duplicates the last entered input to fill any remaining sets.
   */
  protected duplicateLastInput(values: number[]): void {
    const lastInput = values[values.length - 1];
    this.inputElement.value = `${this.inputElement.value}${this.delimiter}${lastInput}`;
  }
}
