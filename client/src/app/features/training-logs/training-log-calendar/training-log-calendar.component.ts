import { CommonModule } from '@angular/common';
import { Component, effect, model, signal, WritableSignal } from '@angular/core';
import { IconName } from '../../../shared/icon/icon-name';
import { IsCurrentDayPipe } from './is-current-day.pipe';
import { MonthNavigationComponent } from './month-navigation/month-navigation.component';

@Component({
  selector: 'app-training-log-calendar',
  standalone: true,
  imports: [CommonModule, MonthNavigationComponent, IsCurrentDayPipe],
  templateUrl: './training-log-calendar.component.html',
  styleUrls: ['./training-log-calendar.component.scss'],
})
export class TrainingLogCalendarComponent {
  protected readonly IconName = IconName;

  currentDay = signal(new Date().getDate());
  currentMonth = model(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  daysInMonth: WritableSignal<number[]> = signal([]);
  daysFromPreviousMonth: WritableSignal<number[]> = signal([]);
  daysFromNextMonth: WritableSignal<number[]> = signal([]);

  constructor() {
    effect(
      () => {
        this.generateCalendar();
      },
      { allowSignalWrites: true },
    );
  }

  private generateCalendar() {
    const daysInCurrentMonth = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();

    const firstDayOfMonth = new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    const daysInPreviousMonth = new Date(this.currentYear(), this.currentMonth(), 0).getDate();

    const startIndex = (firstDayOfMonth + 6) % 7;
    const daysFromPreviousMonth = Array.from(
      { length: startIndex },
      (_, i) => daysInPreviousMonth - startIndex + i + 1,
    );
    this.daysFromPreviousMonth.set(daysFromPreviousMonth);

    const daysInMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
    this.daysInMonth.set(daysInMonth);

    const totalDays = this.daysFromPreviousMonth().length + this.daysInMonth().length;
    const remainingDays = 7 - (totalDays % 7);
    const daysFromNextMonth = remainingDays < 7 ? Array.from({ length: remainingDays }, (_, i) => i + 1) : [];
    this.daysFromNextMonth.set(daysFromNextMonth);
  }
}
