import { Component, computed, effect, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateGranularity } from './date-granularity';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  /**
   * Signal to store the selected date as a `Date` object.
   */
  value = model(new Date());

  /**
   * Input to determine the granularity of the date picker (e.g., WEEK or DAY).
   */
  granularity = input(DateGranularity.WEEK);

  /**
   * Computed signal for the first selectable date based on the granularity.
   */
  firstSelectableDate = computed(() => {
    if (this.isWeekGranularity()) {
      return this.getNextMonday();
    }
    return this.getToday();
  });

  /**
   * Computed signal for the date step based on the granularity.
   */
  dateStep = computed(() => {
    if (this.granularity() === DateGranularity.WEEK) {
      return 7;
    }
    return 1;
  });

  /**
   * Signal to store the selected date as a string (yyyy-mm-dd) for template binding.
   */
  templateDate = signal('');

  constructor() {
    effect(
      () => {
        this.updateTemplateDate(this.value());
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Callback, der aufgerufen wird, wenn das Datum geändert wird.
   * @param event Event-Objekt des change-Ereignisses
   */
  onDateChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    const dateString = inputElement.value;

    this.templateDate.set(dateString);

    const [year, month, day] = dateString.split('-').map(Number);

    if (!year || !month || !day) {
      return;
    }

    const newDate = new Date(year, month - 1, day);

    if (!isNaN(newDate.getTime()) && this.value().getTime() !== newDate.getTime()) {
      this.value.set(newDate);
    }
  }

  /**
   * Returns the next Monday's date as a string formatted as yyyy-MM-dd.
   */
  protected getNextMonday(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 1 : 8 - day;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diff);
    return nextMonday.toISOString().split('T')[0];
  }

  /**
   * Returns today's date as a string (yyyy-MM-dd).
   */
  private getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Updates the `templateDate` signal with a formatted version of `selectedDate`.
   */
  private updateTemplateDate(date: Date): void {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const formattedDate = `${year}-${month}-${day}`;

    if (formattedDate !== this.templateDate()) {
      this.templateDate.set(formattedDate);
    }
  }

  /**
   * Checks if the granularity is set to WEEK.
   */
  private isWeekGranularity(): boolean {
    return this.granularity() === DateGranularity.WEEK;
  }
}
