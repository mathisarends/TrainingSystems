import { Component, effect, Injector, model, OnInit, signal } from '@angular/core'; // Signal für Angular 18 verwenden
import { FormsModule } from '@angular/forms'; // Falls du Template-Formulare nutzt

@Component({
  selector: 'app-date-picker',
  standalone: true, // Standalone-Komponente
  imports: [FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [],
})
export class DatePickerComponent implements OnInit {
  selectedDate = model.required<Date>();

  templateDate = signal('');

  constructor(private injector: Injector) {}

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
