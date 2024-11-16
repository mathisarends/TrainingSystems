import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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

  trainingDays = signal(new Set(['Mo', 'Mi', 'Fr']));

  toggleTrainingDay(day: string): void {
    const updatedDays = new Set(this.trainingDays());
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    this.trainingDays.set(updatedDays);
  }
}
