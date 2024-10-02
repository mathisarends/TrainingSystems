import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormService } from '../../../../core/services/form.service';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { EstMaxService } from '../services/estmax.service';
import { ExerciseTableRowService } from '../services/exercise-table-row.service';
import { AbstractDoubleClickDirective } from './abstract-double-click.directive';

/**
 * Directive that extends the AbstractDoubleClickDirective to add RPE input-specific functionality.
 */
@Directive({
  selector: '[rpeInputDirective]',
  standalone: true,
})
export class RpeInputDirective extends AbstractDoubleClickDirective {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;

  constructor(
    protected override autoSaveService: AutoSaveService,
    protected override formService: FormService,
    protected override exerciseTableRowService: ExerciseTableRowService,
    protected override elementRef: ElementRef,
    private estMaxService: EstMaxService,
  ) {
    super(autoSaveService, formService, exerciseTableRowService, elementRef);
  }

  @HostListener('change', ['$event'])
  override onChange(event: Event): void {
    const rpeValues = this.parseInputValues();

    if (rpeValues.length === 1) {
      this.updateSingleRPE(rpeValues[0]);
    } else {
      this.updateMultipleRPEs(rpeValues);
    }

    if (this.isActualRpeInput()) {
      this.estMaxService.calculateMaxAfterInputChange(event.target as HTMLInputElement);
    }

    super.onChange(event); // Call parent method to handle additional logic
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
    const setInput = this.exerciseTableRowService.getSetInputByElement(this.inputElement);

    if (rpeValues.length === Number(setInput.value)) {
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

  /**
   * Checks if the current input is an actual RPE input field.
   */
  private isActualRpeInput(): boolean {
    return this.inputElement.closest('app-input')!.classList.contains('actualRPE');
  }
}
