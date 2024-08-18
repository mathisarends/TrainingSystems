import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../service/tooltip/tooltip.directive';

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss'],
})
export class ActivityCalendar {
  trainingDays = input.required<number>();
  grid: { day: number; value: number; level: number }[] = [];

  constructor() {
    // Beispielwerte, um die Trainingsaktivität zu simulieren
    this.grid = Array.from({ length: 364 }, (_, day) => ({
      day,
      value: Math.floor(Math.random() * 1000), // Beispielwerte zwischen 0 und 1000
      level: 0, // Initialisiertes Level
    }));

    this.calculateLevels();
  }

  calculateLevels() {
    const values = this.grid.map((item) => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Quantile berechnen
    const thresholds = this.calculateQuantiles(values, [0.25, 0.5, 0.75]);

    this.grid.forEach((item) => {
      item.level = this.getLevelForValue(item.value, thresholds);
    });
  }

  calculateQuantiles(values: number[], quantiles: number[]): number[] {
    const sortedValues = values.sort((a, b) => a - b);
    return quantiles.map((q) => {
      const pos = (sortedValues.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sortedValues[base + 1] !== undefined) {
        return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
      } else {
        return sortedValues[base];
      }
    });
  }

  getLevelForValue(value: number, thresholds: number[]): number {
    if (value > thresholds[2]) {
      return 4;
    } else if (value > thresholds[1]) {
      return 3;
    } else if (value > thresholds[0]) {
      return 2;
    } else {
      return 1;
    }
  }
}
