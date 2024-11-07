import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { IsDaySelectedPipe } from './is-day-selected.pipe';

@Component({
  selector: 'app-training-day-selection',
  standalone: true,
  imports: [IsDaySelectedPipe],
  templateUrl: './training-day-selection.component.html',
  styleUrls: ['./training-day-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingDaySelectionComponent {
  protected readonly weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  selectedDays = model<Set<string>>(new Set());

  protected toggleDay(day: string): void {
    const updatedDays = new Set(this.selectedDays());
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    this.selectedDays.set(updatedDays);
  }
}
