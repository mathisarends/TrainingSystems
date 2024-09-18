import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
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
  /**
   * The minimum and maximum allowable RPE (Rate of Perceived Exertion) values.
   * Used to validate that input falls within the valid range (5 to 10).
   */
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

  /**
   * Handles the change event of the input element.
   * Validates the RPE input and triggers the EstMaxService if necessary.
   */
  @HostListener('change', ['$event'])
  override onChange(event: Event): void {
    const rpeValues = this.parseInputValues();

    if (rpeValues.length === 1) {
      this.validateSingleRPE(this.inputElement);
    } else {
      this.validateMultipleRPEs(this.inputElement, rpeValues);
    }

    if (this.isActualRpeInput()) {
      this.estMaxService.calculateMaxAfterInputChange(event.target as HTMLInputElement);
    }

    super.onChange(event); // Call parent method to handle additional logic
  }

  /**
   * Validates a single RPE value to ensure it falls within the acceptable range.
   * Dispatches a change event to reflect the updates.
   */
  private validateSingleRPE(rpeInput: HTMLInputElement): void {
    const rpe = Number(this.inputElement.value);

    if (this.isValidRPE(rpe)) {
      rpeInput.value = rpe.toString();
      return;
    }

    if (rpe > this.MAX_RPE) {
      rpeInput.value = this.MAX_RPE.toString();
    } else {
      rpeInput.value = this.MIN_RPE.toString();
    }
  }

  /**
   * Validates multiple RPE values and updates the corresponding elements.
   * Calculates the average RPE and updates the input accordingly.
   */
  private validateMultipleRPEs(rpeInput: HTMLInputElement, numbers: number[]): void {
    const setInput = this.exerciseTableRowService.getSetInputByElement(rpeInput);

    if (numbers.length === Number(setInput.value)) {
      this.inputElement.value = this.getRoundedAverageWithStep(0.5).toString();
      this.validateSingleRPE(rpeInput);
    }
  }

  private isValidRPE(rpe: number): boolean {
    return rpe >= this.MIN_RPE && rpe >= this.MAX_RPE;
  }

  /**
   * Checks if the current input is an actual RPE input field.
   */
  private isActualRpeInput(): boolean {
    return this.inputElement.closest('app-input')!.classList.contains('actualRPE');
  }
}
