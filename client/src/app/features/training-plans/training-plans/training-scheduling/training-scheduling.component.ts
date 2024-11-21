import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { DatePickerComponent } from '../../../../shared/components/datepicker/date-picker.component';
import { InfoComponent } from '../../../../shared/components/info/info.component';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { DaySelectedPipe } from './day-selected-pipe';

@Component({
  selector: 'app-training-scheduling',
  standalone: true,
  imports: [InfoComponent, CommonModule, DaySelectedPipe, DatePickerComponent],
  templateUrl: './training-scheduling.component.html',
  styleUrls: ['./training-scheduling.component.scss'],
})
export class TrainingSchedulingComponent {
  days = signal(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);

  dayNumbers = computed(() => {
    return this.days().map((_, index) => index + 1);
  });

  constructor(protected trainingPlanEditView: TrainingPlanEditView) {}

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
}
