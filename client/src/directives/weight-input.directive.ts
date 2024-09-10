import { Directive, HostListener, Input, ElementRef, AfterViewInit } from '@angular/core';
import { InteractiveElementService } from '../service/util/interactive-element.service';
import { FormService } from '../service/form/form.service';
import { ExerciseTableRowService } from '../service/training/exercise-table-row.service';

/**
 * Directive that extends the InteractiveElementDirective to add additional functionality.
 */
@Directive({
  selector: '[weightInput]',
  standalone: true,
})
export class WeightInputDirective implements AfterViewInit {
  /**
   * Input property to bind the weight input value from the parent component.
   */
  @Input() weightInput!: string;

  /**
   * Reference to the host input element.
   */
  private inputElement!: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private interactiveElementService: InteractiveElementService,
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
  ) {}

  /**
   * Lifecycle hook that runs after the view is initialized.
   * It assigns the host element to the inputElement property.
   */
  ngAfterViewInit(): void {
    this.inputElement = this.elementRef.nativeElement as HTMLInputElement;
  }

  /**
   * Handles the double-click event on the input element.
   * On double-click, the last entered weight value is duplicated to fill in
   * the remaining sets, if any sets are left unfilled.
   */
  @HostListener('dblclick', ['$event'])
  onDoubleClick(): void {
    const weightValues = this.parseWeightInputValues(this.inputElement);
    const amountOfSets = this.getAmountOfSets();

    const isSetLeft = weightValues.length < amountOfSets;
    if (!isSetLeft) {
      return;
    }

    this.duplicateLastWeightInput(weightValues);
  }

  /**
   * Handles the focus event of the interactive element.
   * When the element gains focus, its value is stored by the InteractiveElementService.
   */
  @HostListener('focus', ['$event.target'])
  handleFocusEvent(): void {
    this.interactiveElementService.focus(this.inputElement.value);
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   */
  @HostListener('blur', ['$event.target'])
  handleBlurEvent(): void {
    const weightValues = this.parseWeightInputValues(this.inputElement);
    const amountOfSets = this.getAmountOfSets();

    const setsFinished = weightValues.length === amountOfSets;
    if (setsFinished) {
      const roundedWeight = this.calculateRoundedWeight(weightValues);
      this.inputElement.value = roundedWeight.toString();

      this.formService.addChange(this.inputElement.name, this.inputElement.value);
      this.interactiveElementService.triggerChangeIfModified(this.inputElement.value);
    }
  }

  /**
   * Handles the input event of the input element.
   * On each input change, the new value is tracked via the FormService.
   */
  @HostListener('input', ['$event'])
  handleInputChange(event: Event): void {
    this.formService.trackChange(event);
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
  private duplicateLastWeightInput(weightValues: number[]): void {
    const lastWeightInput = weightValues[weightValues.length - 1];
    this.inputElement.value = `${this.inputElement.value};${lastWeightInput}`;
  }

  /**
   * Calculates the rounded average weight from the entered values.
   * The rounding is done to the nearest 2.5 units (standard for weight increments).
   */
  private calculateRoundedWeight(weightValues: number[]): number {
    const averageWeight = weightValues.reduce((acc, curr) => acc + curr, 0) / weightValues.length;
    return Math.round(averageWeight / 2.5) * 2.5;
  }

  /**
   * Parses the weight input values entered in the input field.
   * The values are expected to be separated by semicolons (';') and may include commas (',') which are replaced with dots ('.') for parsing.
   */
  private parseWeightInputValues(weightInput: HTMLInputElement): number[] {
    return weightInput.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }
}
