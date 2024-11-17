import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { DaySelectedPipe } from './day-selected-pipe';

@Component({
  selector: 'app-training-scheduling',
  standalone: true,
  imports: [AlertComponent, CommonModule, DaySelectedPipe],
  templateUrl: './training-scheduling.component.html',
  styleUrls: ['./training-scheduling.component.scss'],
})
export class TrainingSchedulingComponent {
  days = signal(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);

  dayNumbers = computed(() => {
    return this.days().map((_, index) => index + 1);
  });

  trainingDays = signal(new Set(['Mo', 'Mi', 'Fr']));

  protected toggleTrainingDayByNumber(dayNumber: number): void {
    const day = this.days()[dayNumber - 1];
    if (!day) {
      // Falls ungültig, abbrechen
    }

    const updatedDays = new Set(this.trainingDays());
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    this.trainingDays.set(updatedDays);
  }
}
