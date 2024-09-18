import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementService } from '../../../../shared/service/interactive-element.service';
import { ExerciseDataService } from '../exercise-data.service';
import { EstMaxService } from '../services/estmax.service';
import { ExerciseTableRowService } from '../services/exercise-table-row.service';
import { PauseTimeService } from '../services/pause-time.service';

/**
 * Directive that extends the InteractiveElementDirective to add additional functionality.
 */
@Directive({
  selector: '[weightInput]',
  standalone: true,
})
export class WeightInputDirective implements AfterViewInit {
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
    private elementRef: ElementRef,
    private interactiveElementService: InteractiveElementService,
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
    private exerciseDataService: ExerciseDataService,
    private pauseTimeService: PauseTimeService,
    private estMaxService: EstMaxService,
  ) {}

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
    const weightValues = this.parseWeightInputValues();
    const amountOfSets = this.getAmountOfSets();

    const setsFinished = weightValues.length === amountOfSets;
    if (setsFinished) {
      const roundedWeight = this.calculateRoundedWeight(weightValues);
      this.inputElement.value = roundedWeight.toString();

      this.formService.addChange(this.inputElement.name, this.inputElement.value);
      this.interactiveElementService.triggerChangeIfModified(this.inputElement.value);
    }
  }

  @HostListener('change', ['$event'])
  startPauseTimert(event: Event): void {
    const categoryValue = this.exerciseTableRowService.getExerciseCategorySelectorByElement(this.inputElement).value;
    const pauseTime = this.exerciseDataService.getExerciseData().categoryPauseTimes[categoryValue];

    console.log('here');

    this.pauseTimeService.startPauseTimer(pauseTime);
    this.estMaxService.calculateMaxAfterInputChange(event);
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
   * Custom double-click handler.
   * On double-click, the last entered weight value is duplicated to fill in
   * the remaining sets, if any sets are left unfilled.
   */
  private onDoubleClick(): void {
    const weightValues = this.parseWeightInputValues();
    const amountOfSets = this.getAmountOfSets();

    const isSetLeft = weightValues.length < amountOfSets;
    if (!isSetLeft) {
      return;
    }

    this.duplicateLastWeightInput(weightValues);

    // Dismiss the keyboard on mobile devices by removing focus from the input element
    this.inputElement.blur();
    this.inputElement.dispatchEvent(new Event('change'));
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
  private parseWeightInputValues(): number[] {
    return this.inputElement.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }
}
