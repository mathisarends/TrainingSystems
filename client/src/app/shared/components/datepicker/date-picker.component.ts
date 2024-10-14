import { Component, effect, Injector, model, OnInit, signal } from '@angular/core';

// TODO: use this to filter log data for certain dates + (initially laod all)
@Component({
  selector: 'app-date-picker',
  standalone: true, // Standalone-Komponente
  imports: [],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [],
})
export class DatePickerComponent implements OnInit {
  /**
   * Stores the selected date.
   */
  selectedDate = model.required<Date>();

  /**
   * Signal storing the date in a string format (yyyy-mm-dd) for template binding.
   */
  templateDate = signal('');

  constructor(private injector: Injector) {}

  /**
   * Initializes the component by syncing the selected date with the template string format.
   */
  ngOnInit(): void {
    const templateDate = this.selectedDate().toISOString().substring(0, 10);
    this.templateDate.set(templateDate);

    effect(
      () => {
        const newDate = new Date(this.templateDate());
        this.selectedDate.set(newDate);
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }
}
