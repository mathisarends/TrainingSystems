import { Component, effect, ElementRef, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractDoubleClickHandler } from '../abstract-double-click-handler';
import { InputParsingService } from '../../../../shared/service/input-parsing.service';

@Component({
  selector: 'app-rpe-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rpe-input.component.html',
})
export class RpeInputComponent extends AbstractDoubleClickHandler {
  /**
   * RPE input value as a signal.
   */
  rpe = model<string | undefined>(undefined);

  /**
   * Number of sets required for the input.
   */
  numberOfSets = input.required<number>();

  /**
   * Emits the RPE change.
   */
  rpeChanged = output<string>();

  constructor(
    protected override elementRef: ElementRef,
    protected override inputParsingService: InputParsingService,
  ) {
    super(elementRef, inputParsingService);

    effect(() => {
      if (this.rpe()) {
        this.rpeChanged.emit(this.rpe()!);
      }
    });
  }

  /**
   * Handles double-click events for RPE input.
   */
  protected handleDoubleClick(): void {
    const rpeArray = this.inputParsingService.parseInputValues(this.rpe() ?? '');
    if (rpeArray.length === 0) {
      return;
    }

    if (rpeArray.length < this.numberOfSets()) {
      const updatedRpe = this.duplicateLastValue(rpeArray, this.numberOfSets());
      this.rpe.set(updatedRpe.join(this.delimiter));

      if (updatedRpe.length === this.numberOfSets()) {
        const rpeArray = this.inputParsingService.parseInputValues(this.rpe() ?? '');
        const averageRpe = this.inputParsingService.calculateRoundedAverage(rpeArray, 0.5).toString();
        this.rpe.set(averageRpe);
      }
    }
  }

  /**
   * Handles RPE value changes and validates the input.
   */
  protected onRpeChanged(event: Event): void {
    const newRpe = (event.target as HTMLInputElement).value;

    const validatedRpe = this.validateInput(newRpe);
    this.rpe.set(validatedRpe);

    const rpeArray = this.inputParsingService.parseInputValues(validatedRpe);
    if (rpeArray.length === this.numberOfSets()) {
      const averageRpe = this.inputParsingService.calculateRoundedAverage(rpeArray, 0.5).toString();
      this.rpe.set(averageRpe);
    }
  }

  protected validateInput(input: string): string {
    const baseValidatedInput = this.inputParsingService.validateInput(input);

    const rpeArray = this.inputParsingService.parseInputValues(baseValidatedInput);

    const validatedRpeArray = rpeArray.map((value) => {
      if (value < 5) {
        return 5;
      }

      if (value > 10) {
        return 10;
      }

      return value;
    });

    return validatedRpeArray.join(this.delimiter);
  }
}
