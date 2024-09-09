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
  @Input() weightInput!: string;
  private inputElement!: HTMLInputElement;

  constructor(
    private el: ElementRef, // Inject ElementRef to access the wrapper element
    private interactiveElementService: InteractiveElementService,
    private formService: FormService,
    private exerciseTableRowService: ExerciseTableRowService,
  ) {}

  ngAfterViewInit(): void {
    // Find the actual input element inside the wrapper
    this.inputElement = this.el.nativeElement.querySelector('input') as HTMLInputElement;
    if (!this.inputElement) {
      throw new Error('No input element found inside the wrapper');
    }
  }

  /**
   * Handles the focus event of the interactive element.
   * When the element gains focus, its value is stored by the InteractiveElementService.
   */
  @HostListener('focus', ['$event.target'])
  handleFocusEvent(): void {
    if (this.inputElement) {
      this.interactiveElementService.focus(this.inputElement.value);
    }
  }

  /**
   * Handles the blur event of the interactive element.
   * When the element loses focus, its value is compared to the stored value to detect changes.
   */
  @HostListener('blur', ['$event.target'])
  handleBlurEvent(): void {
    if (this.inputElement) {
      const weightValues = this.parseWeightInputValues(this.inputElement);
      const amountOfSets = Number(this.exerciseTableRowService.getSetInputByElement(this.inputElement).value);

      if (weightValues.length === amountOfSets) {
        const roundedWeight = this.calculateRoundedWeight(weightValues);
        this.inputElement.value = roundedWeight.toString();
      }

      this.formService.addChange(this.inputElement.name, this.inputElement.value);
      this.interactiveElementService.triggerChangeIfModified(this.inputElement.value);
    }
  }

  /**
   * Handles the input event of the interactive element.
   * When the value of the element changes, the new value is tracked by the FormService.
   */
  @HostListener('input', ['$event'])
  handleInputChange(event: Event): void {
    this.formService.trackChange(event);
  }

  // Helper methods...

  private calculateRoundedWeight(weightValues: number[]): number {
    const averageWeight = weightValues.reduce((acc, curr) => acc + curr, 0) / weightValues.length;
    return Math.round(averageWeight / 2.5) * 2.5;
  }

  private parseWeightInputValues(weightInput: HTMLInputElement): number[] {
    return weightInput.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }
}
