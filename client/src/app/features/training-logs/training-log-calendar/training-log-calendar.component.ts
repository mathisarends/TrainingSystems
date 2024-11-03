import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-training-log-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-log-calendar.component.html',
  styleUrls: ['./training-log-calendar.component.scss']
})
export class TrainingLogCalendarComponent {
  currentMonth: string = 'November 2024';
  daysInMonth: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
    
  currentDay: number = new Date().getDate(); 


  constructor() {
  }
}