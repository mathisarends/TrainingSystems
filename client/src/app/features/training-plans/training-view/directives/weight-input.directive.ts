import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { ExerciseDataService } from '../exercise-data.service';
import { EstMaxService } from '../services/estmax.service';
import { ExerciseTableRowService } from '../services/exercise-table-row.service';
import { PauseTimeService } from '../services/pause-time.service';
import { AbstractDoubleClickDirective } from './abstract-double-click.directive';

/**
 * Directive that extends the AbstractDoubleClickDirective
 * to add additional functionality specific to weight input handling.
 */
@Directive({
  selector: '[weightInput]',
  standalone: true,
})
export class WeightInputDirective extends AbstractDoubleClickDirective implements AfterViewInit {
  constructor(
    private elementRef: ElementRef,
    private exerciseTableRowService: ExerciseTableRowService,
    private exerciseDataService: ExerciseDataService,
    private pauseTimeService: PauseTimeService,
    private estMaxService: EstMaxService,
    protected override autoSaveService: AutoSaveService,
    protected override formService: FormService,
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

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   */
  @HostListener('blur', ['$event.target'])
  handleBlurEvent(): void {
    const weightValues = this.parseInputValues();
    const amountOfSets = this.getAmountOfSets();

    const setsFinished = weightValues.length === amountOfSets;
    if (setsFinished) {
      const roundedWeight = this.calculateRoundedWeight(weightValues);
      this.inputElement.value = roundedWeight.toString();

      this.formService.addChange(this.inputElement.name, this.inputElement.value);
      this.autoSaveService.save();
    }
  }

  @HostListener('change', ['$event'])
  startPauseTimer(event: Event): void {
    const categoryValue = this.exerciseTableRowService.getExerciseCategorySelectorByElement(this.inputElement).value;
    const pauseTime = this.exerciseDataService.getExerciseData().categoryPauseTimes[categoryValue];

    this.pauseTimeService.startPauseTimer(pauseTime);
    this.estMaxService.calculateMaxAfterInputChange(event.target as HTMLInputElement);
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
  protected onDoubleClick(): void {
    const weightValues = this.parseInputValues(); // Using inherited method
    const amountOfSets = this.getAmountOfSets();

    const isSetLeft = weightValues.length < amountOfSets;
    if (!isSetLeft) {
      return;
    }

    this.duplicateLastInput(weightValues); // Using inherited method

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
   * Calculates the rounded average weight from the entered values.
   * The rounding is done to the nearest 2.5 units (standard for weight increments).
   */
  private calculateRoundedWeight(weightValues: number[]): number {
    const averageWeight = weightValues.reduce((acc, curr) => acc + curr, 0) / weightValues.length;
    return Math.round(averageWeight / 2.5) * 2.5;
  }
}
