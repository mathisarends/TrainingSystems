import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss'],
})
export class ActivityCalendar {
  grid: number[] = Array(364).fill(0);

  constructor() {
    // Example data to simulate contribution levels
    this.grid[30] = 1;
    this.grid[31] = 2;
    this.grid[32] = 3;
    this.grid[60] = 4;
    this.grid[90] = 2;
    // Add more data points as needed
  }

  getDayClass(index: number): string {
    const level = this.grid[index];
    return `level-${level}`;
  }
}
