// date-picker.component.ts
import { CommonModule, DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  selectedDate = signal(new Date());

  onDateSelect(event: Event): void {
    console.log('🚀 ~ DatePickerComponent ~ onDateSelect ~ event:', event);
  }
}
