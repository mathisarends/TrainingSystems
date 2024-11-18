import { Component, effect, input, model, signal } from '@angular/core';

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

  firstDate = input<string>(this.getNextMonday());

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
  }

  protected getNextMonday(): string {
    const today = new Date();
    const day = today.getDay(); // 0 = Sonntag, 1 = Montag, etc.
    const diff = day === 0 ? 1 : 8 - day; // Unterschied bis zum nächsten Montag
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diff);
    return nextMonday.toISOString().split('T')[0]; // Format YYYY-MM-DD
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

    if (!isNaN(newDate.getTime()) && this.selectedDate().getTime() !== newDate.getTime()) {
      this.selectedDate.set(newDate);
    }
  }
}
