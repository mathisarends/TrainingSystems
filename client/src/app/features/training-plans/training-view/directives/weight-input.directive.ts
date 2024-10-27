import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';
import { FormService } from '../../../../core/services/form.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
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
    private exerciseDataService: ExerciseDataService,
    private pauseTimeService: PauseTimeService,
    private estMaxService: EstMaxService,
    protected autoSaveService: AutoSaveService,
    protected formService: FormService,
    protected override exerciseTableRowService: ExerciseTableRowService,
    protected override elementRef: ElementRef,
    protected override toastService: ToastService,
  ) {
    super(exerciseTableRowService, elementRef, toastService);
  }

  @HostListener('change', ['$event'])
  async startPauseTimer(event: Event): Promise<void> {
    event.stopPropagation();
    const categoryValue = this.exerciseTableRowService.getExerciseCategorySelectorByElement(this.inputElement).value;
    const exerciseName = this.exerciseTableRowService.getExerciseNameSelectorByElement(this.inputElement).value;
    const pauseTime = this.exerciseDataService.exerciseData.categoryPauseTimes[categoryValue];

    if (this.isLastSet()) {
      const roundedWeight = this.getRoundedAverageWithStep(2.5);
      this.inputElement.value = roundedWeight.toString();
    }
    this.formService.addChange(this.inputElement.name, this.inputElement.value);
    this.autoSaveService.save();

    this.estMaxService.calculateMaxAfterInputChange(event.target as HTMLInputElement);
    this.pauseTimeService.startPauseTimer(pauseTime, exerciseName);
  }
}
