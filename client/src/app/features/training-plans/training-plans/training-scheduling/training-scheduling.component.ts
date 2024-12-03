import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { DatePickerComponent } from '../../../../shared/components/datepicker/date-picker.component';
import { InfoComponent } from '../../../../shared/components/info/info.component';
import { ModalValidationService } from '../../../../shared/components/modal/modal-validation.service';
import { Validatable } from '../../../../shared/components/modal/validatable';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { DaySelectedPipe } from './day-selected-pipe';

@Component({
  selector: 'app-training-scheduling',
  standalone: true,
  imports: [InfoComponent, CommonModule, DaySelectedPipe, DatePickerComponent],
  templateUrl: './training-scheduling.component.html',
  styleUrls: ['./training-scheduling.component.scss'],
})
export class TrainingSchedulingComponent implements Validatable {
  days = signal(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);

  dayNumbers = computed(() => {
    return this.days().map((_, index) => index + 1);
  });

  isSelectionValid = computed(() => this.trainingPlanEditView.isTrainingFrequencyValid());

  constructor(
    protected trainingPlanEditView: TrainingPlanEditView,
    protected modalValidatonService: ModalValidationService,
  ) {
    effect(
      () => {
        this.validate();
        const test = this.trainingPlanEditView.startDate();
        console.log('🚀 ~ TrainingSchedulingComponent ~ test:', test);
      },
      { allowSignalWrites: true },
    );
  }

  protected toggleTrainingDayByNumber(dayNumber: number): void {
    const day = this.days()[dayNumber - 1];

    const updatedDays = new Set(this.trainingPlanEditView.trainingDays());
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    this.trainingPlanEditView.trainingDays.set(updatedDays);
  }

  validate(): void {
    const isValid = this.trainingPlanEditView.isTrainingFrequencyValid();
    this.modalValidatonService.updateValidationState(isValid);
  }

  ngOnDestroy(): void {
    this.modalValidatonService.updateValidationState(true);
  }
}
