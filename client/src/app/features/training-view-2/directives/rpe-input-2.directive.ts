import { Directive, HostListener } from '@angular/core';
import { AbstractDoubleClickDirective2 } from './abstract-double-click2.directive';

/**
 * Directive that extends the AbstractDoubleClickDirective to add RPE input-specific functionality.
 */
@Directive({
  selector: '[rpeInputDirective2]',
  standalone: true,
})
export class RpeInputDirective2 extends AbstractDoubleClickDirective2 {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;

  @HostListener('change', ['$event'])
  onChange(): void {
    const rpeValues = this.parseInputValues();

    if (rpeValues.length === 1) {
      this.updateSingleRPE(rpeValues[0]);
    } else {
      this.updateMultipleRPEs(rpeValues);
    }
  }

  /**
   * Validates and updates a single RPE value.
   */
  private updateSingleRPE(rpe: number): void {
    const validRPE = this.validateRPE(rpe);
    this.updateInputValue(validRPE);
  }

  /**
   * Validates and updates multiple RPE values.
   */
  private updateMultipleRPEs(rpeValues: number[]): void {
    if (rpeValues.length === this.numberOfSets()) {
      const averageRPE = this.getRoundedAverageWithStep(0.5);
      const validRPE = this.validateRPE(averageRPE);
      this.updateInputValue(validRPE);
    }
  }

  /**
   * Updates the input element's value.
   */
  private updateInputValue(value: number): void {
    this.inputElement.value = value.toString();
  }

  /**
   * Validates an RPE value to ensure it falls within the acceptable range.
   */
  private validateRPE(rpe: number): number {
    return Math.min(Math.max(rpe, this.MIN_RPE), this.MAX_RPE);
  }
}
