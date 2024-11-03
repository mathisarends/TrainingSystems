import { CommonModule } from '@angular/common';
import { Component, effect, signal, WritableSignal } from '@angular/core';
import { IconName } from '../../../shared/icon/icon-name';
import { MonthNavigationComponent } from './month-navigation/month-navigation.component';

@Component({
  selector: 'app-training-log-calendar',
  standalone: true,
  imports: [CommonModule, MonthNavigationComponent],
  templateUrl: './training-log-calendar.component.html',
  styleUrls: ['./training-log-calendar.component.scss'],
})
export class TrainingLogCalendarComponent {
  protected readonly IconName = IconName;

  currentDay = signal(new Date().getDate());
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  daysInMonth: WritableSignal<number[]> = signal([]);
  daysFromPreviousMonth: WritableSignal<number[]> = signal([]);
  daysFromNextMonth: WritableSignal<number[]> = signal([]);

  constructor() {
    effect(
      () => {
        console.log('called');
        this.generateCalendar();
      },
      { allowSignalWrites: true },
    );
  }

  // Methode zur Generierung des Kalenders
  private generateCalendar() {
    const daysInCurrentMonth = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();

    const firstDayOfMonth = new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    const daysInPreviousMonth = new Date(this.currentYear(), this.currentMonth(), 0).getDate();

    // Berechnung der Tage des vorherigen Monats, um die Woche zu vervollständigen
    const startIndex = (firstDayOfMonth + 6) % 7;
    const daysFromPreviousMonth = Array.from(
      { length: startIndex },
      (_, i) => daysInPreviousMonth - startIndex + i + 1,
    );
    this.daysFromPreviousMonth.set(daysFromPreviousMonth);

    // Berechnung der Tage des aktuellen Monats
    const daysInMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
    this.daysInMonth.set(daysInMonth);

    // Berechnung der Tage des nächsten Monats, um den Kalender zu vervollständigen
    const totalDays = this.daysFromPreviousMonth().length + this.daysInMonth().length;
    const remainingDays = 7 - (totalDays % 7);
    const daysFromNextMonth = remainingDays < 7 ? Array.from({ length: remainingDays }, (_, i) => i + 1) : [];
    this.daysFromNextMonth.set(daysFromNextMonth);
  }
}
