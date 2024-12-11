import { Directive, ElementRef, HostListener, signal } from '@angular/core';
import { InputParsingService } from '../../../shared/service/input-parsing.service';

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

  protected constructor(
    protected elementRef: ElementRef,
    protected inputParsingService: InputParsingService,
  ) {}

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
   * Duplicates the last value in the array by adding it once.
   */
  protected duplicateLastValue(values: number[], setsToFill: number): number[] {
    if (values.length < setsToFill) {
      const lastValue = values[values.length - 1];
      return [...values, lastValue];
    }
    return values;
  }
}
