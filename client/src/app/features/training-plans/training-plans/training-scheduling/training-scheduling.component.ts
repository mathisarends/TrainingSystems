import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { DatePickerComponent } from '../../../../shared/components/datepicker/date-picker.component';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { DaySelectedPipe } from './day-selected-pipe';

@Component({
  selector: 'app-training-scheduling',
  standalone: true,
  imports: [AlertComponent, CommonModule, DaySelectedPipe, DatePickerComponent],
  templateUrl: './training-scheduling.component.html',
  styleUrls: ['./training-scheduling.component.scss'],
})
export class TrainingSchedulingComponent {
  currentDate = new Date();

  days = signal(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);

  dayNumbers = computed(() => {
    return this.days().map((_, index) => index + 1);
  });

  constructor(protected trainingPlanEditView: TrainingPlanEditView) {
    effect(() => {
      const startDate = this.trainingPlanEditView.startDate();
      console.log('🚀 ~ TrainingSchedulingComponent ~ effect ~ startDate:', startDate);
    });
  }

  protected toggleTrainingDayByNumber(dayNumber: number): void {
    const day = this.days()[dayNumber - 1];
    if (!day) {
      // Falls ungültig, abbrechen
    }

    const updatedDays = new Set(this.trainingPlanEditView.trainingDays());
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    this.trainingPlanEditView.trainingDays.set(updatedDays);
  }
}
