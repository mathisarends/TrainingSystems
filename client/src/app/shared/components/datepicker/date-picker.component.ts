import { Component, effect, model, signal } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  /**
   * Signal to store the selected date as a `Date` object.
   */
  selectedDate = model.required<Date>();

  /**
   * Signal to store the selected date as a string (yyyy-mm-dd) for template binding.
   */
  templateDate = signal('');

  constructor() {
    // Effect to update `templateDate` when `selectedDate` changes
    effect(
      () => {
        this.updateTemplateDate(this.selectedDate());
      },
      { allowSignalWrites: true },
    );

    // Effect to update `selectedDate` when `templateDate` changes
    effect(
      () => {
        this.updateSelectedDate(this.templateDate());
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Updates the `templateDate` signal with a formatted version of `selectedDate`.
   */
  private updateTemplateDate(date: Date): void {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const formattedDate = `${year}-${month}-${day}`;
    console.log('🚀 ~ DatePickerComponent ~ updateTemplateDate ~ formattedDate:', formattedDate);

    if (formattedDate !== this.templateDate()) {
      this.templateDate.set(formattedDate);
    }
  }

  /**
   * Updates the `selectedDate` signal based on the `templateDate` string.
   */
  private updateSelectedDate(dateString: string): void {
    const [year, month, day] = dateString.split('-').map(Number);

    // Ensure valid date components
    if (!year || !month || !day) {
      return;
    }

    // Create a new Date object in local time
    const newDate = new Date(year, month - 1, day);

    if (!isNaN(newDate.getTime()) && this.selectedDate().getTime() !== newDate.getTime()) {
      this.selectedDate.set(newDate);
    }
  }
}
