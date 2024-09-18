import { Directive } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementDirective } from '../../../../shared/directives/interactive-element.directive';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';

/**
 * Abstract Directive that extends the InteractiveElementDirective
 * with additional functionalities like input element reference and
 * methods to parse and duplicate input values.
 */
@Directive()
export abstract class AbstractDoubleClickDirective extends InteractiveElementDirective {
  protected inputElement!: HTMLInputElement;

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

  constructor(
    protected override autoSaveService: AutoSaveService,
    protected override formService: FormService,
  ) {
    super(autoSaveService, formService);
  }

  /**
   * Parses the input values entered in the input field.
   * The values are expected to be separated by semicolons (';') and may include commas (',') which are replaced with dots ('.') for parsing.
   */
  protected parseInputValues(): number[] {
    return this.inputElement.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }

  /**
   * Duplicates the last entered input to fill any remaining sets.
   */
  protected duplicateLastInput(values: number[]): void {
    const lastInput = values[values.length - 1];
    this.inputElement.value = `${this.inputElement.value};${lastInput}`;
  }
}
