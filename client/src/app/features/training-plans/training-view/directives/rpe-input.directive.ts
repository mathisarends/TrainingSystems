import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementDirective } from '../../../../shared/directives/interactive-element.directive';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { EstMaxService } from '../services/estmax.service';
import { ExerciseTableRowService } from '../services/exercise-table-row.service';

/**
 * Directive that extends the InteractiveElementDirective to add additional functionality.
 */
@Directive({
  selector: '[rpeInputDirective]',
  standalone: true,
})
export class RpeInputDirective extends InteractiveElementDirective {
  private readonly MIN_RPE = 5;
  private readonly MAX_RPE = 10;

  /**
   * Reference to the host input element.
   */
  private inputElement!: HTMLInputElement;

  /**
   * Stores the timestamp of the last click event.
   * Used to calculate the time difference between clicks for double-click detection.
   */
  private lastClickTime: number = 0;

  /**
   * Time threshold (in milliseconds) to detect a double-click event.
   * If two clicks occur within this time frame, it is considered a double-click.
   */
  private doubleClickThreshold: number = 300;

  constructor(
    protected override autoSaveService: AutoSaveService,
    protected override formService: FormService,
    private elementRef: ElementRef,
    private exerciseTableRowService: ExerciseTableRowService,
    private estMaxService: EstMaxService,
  ) {
    super(autoSaveService, formService);
  }

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
      this.onDoubleClick();
    }

    this.lastClickTime = currentTime;
  }

  @HostListener('change', ['$event'])
  override onChange(event: Event): void {
    if (!this.inputElement.value) return;

    const rpeValues = this.parseRPEInput(this.inputElement.value);

    if (rpeValues.length === 1) {
      this.validateSingleRPE(this.inputElement);
    } else {
      this.validateMultipleRPEs(this.inputElement, rpeValues);
    }

    if (this.isActualRpeInput()) {
      this.estMaxService.calculateMaxAfterInputChange(event.target as HTMLInputElement);
    }

    super.onChange(event);
  }

  /**
   * Custom double-click handler.
   * On double-click, the last entered weight value is duplicated to fill in
   * the remaining sets, if any sets are left unfilled.
   */
  private onDoubleClick(): void {
    const rpeValues = this.parseInputValues();
    const amountOfSets = this.getAmountOfSets();

    const isSetLeft = rpeValues.length < amountOfSets;
    if (!isSetLeft) {
      return;
    }

    this.duplicateLastInput();

    this.inputElement.blur();
    this.inputElement.dispatchEvent(new Event('change'));
  }

  /**
   * Parses the RPE input string and returns an array of numbers.
   * Replaces commas with dots and splits the input by semicolons.
   * @param rpeString - The RPE input string.
   * @returns An array of parsed RPE numbers.
   */
  private parseRPEInput(rpeString: string): number[] {
    return rpeString
      .replace(/,/g, '.')
      .split(';')
      .map((value) => parseFloat(value.trim()))
      .filter((num) => !isNaN(num));
  }

  /**
   * Validates a single RPE value to ensure it falls within the acceptable range.
   * Dispatches a change event to reflect the updates.
   * @param rpe - The RPE value to validate.
   * @param rpeInput - The HTML input element containing the RPE value.
   */
  private validateSingleRPE(rpeInput: HTMLInputElement): void {
    const rpe = Number(this.inputElement.value);

    if (rpe < this.MIN_RPE) {
      rpeInput.value = this.MIN_RPE.toString();
    } else if (rpe > this.MAX_RPE) {
      rpeInput.value = this.MAX_RPE.toString();
    } else {
      rpeInput.value = rpe.toString();
    }
  }

  /**
   * Validates multiple RPE values and updates the corresponding elements.
   * Calculates the average RPE and updates the input accordingly.
   * @param rpeInput - The HTML input element containing the RPE values.
   * @param numbers - The array of RPE values to validate.
   */
  private validateMultipleRPEs(rpeInput: HTMLInputElement, numbers: number[]): void {
    const setInput = this.exerciseTableRowService.getSetInputByElement(rpeInput);

    if (numbers.length === Number(setInput.value)) {
      this.inputElement.value = this.calculateAverageRPE(numbers).toString();
      this.validateSingleRPE(rpeInput);
    }
  }

  /**
   * Calculates the average of an array of RPE values.
   * Rounds the average to the nearest 0.5.
   * @param numbers - The array of RPE values.
   * @returns The rounded average RPE.
   */
  private calculateAverageRPE(numbers: number[]): number {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    return Math.ceil(average / 0.5) * 0.5;
  }

  /**
   * Retrieves the total number of sets from the ExerciseTableRowService.
   */
  private getAmountOfSets(): number {
    return Number(this.exerciseTableRowService.getSetInputByElement(this.inputElement).value);
  }

  /**
   * Duplicates the last entered weight input to fill any remaining sets.
   */
  private duplicateLastInput(): void {
    const weightValues = this.parseInputValues();
    const lastWeightInput = weightValues[weightValues.length - 1];
    this.inputElement.value = `${this.inputElement.value};${lastWeightInput}`;
  }

  /**
   * Parses the weight input values entered in the input field.
   * The values are expected to be separated by semicolons (';') and may include commas (',') which are replaced with dots ('.') for parsing.
   */
  private parseInputValues(): number[] {
    return this.inputElement.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }

  private isActualRpeInput(): boolean {
    return this.inputElement.closest('app-input')!.classList.contains('actualRPE');
  }
}
