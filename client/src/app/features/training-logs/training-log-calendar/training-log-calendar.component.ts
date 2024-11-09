import { CommonModule } from '@angular/common';
import { Component, effect, model, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IconName } from '../../../shared/icon/icon-name';
import { CalendarEventComponent } from './calendar-event/calendar-event.component';
import { TrainingDayCalendarDataDto } from './dto/training-day-calendar-data.dto';
import { IsCurrentDayPipe } from './is-current-day.pipe';
import { MonthNavigationComponent } from './month-navigation/month-navigation.component';

@Component({
  selector: 'app-training-log-calendar',
  standalone: true,
  imports: [CommonModule, MonthNavigationComponent, IsCurrentDayPipe, CalendarEventComponent, SpinnerComponent],
  templateUrl: './training-log-calendar.component.html',
  styleUrls: ['./training-log-calendar.component.scss'],
})
export class TrainingLogCalendarComponent {
  protected readonly IconName = IconName;

  currentDay = signal(new Date().getDate());
  currentMonth = model(new Date().getMonth());
  currentYear = model(new Date().getFullYear());

  daysInMonth: WritableSignal<number[]> = signal([]);
  daysFromPreviousMonth: WritableSignal<number[]> = signal([]);
  daysFromNextMonth: WritableSignal<number[]> = signal([]);

  trainingDayCalendarData$: Observable<TrainingDayCalendarDataDto> | undefined = undefined;

  constructor(private httpService: HttpService) {
    effect(
      () => {
        this.generateCalendar();
      },
      { allowSignalWrites: true },
    );

    this.trainingDayCalendarData$ = this.httpService.get<TrainingDayCalendarDataDto>('/training-calendar');
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
