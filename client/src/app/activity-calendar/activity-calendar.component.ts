import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../service/tooltip/tooltip.directive';
import { MobileService } from '../../service/util/mobile.service';
import { ActivityCalendarEntry, Level } from './activity-calendar-entry';

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss'],
})
export class ActivityCalendar {
  trainingDays = input.required<number>();
  grid: ActivityCalendarEntry[] = [];

  constructor(private mobileService: MobileService) {
    this.grid = Array.from(
      { length: 364 },
      (_, day): ActivityCalendarEntry => ({
        day: day as 0 | 363,
        value: Math.floor(Math.random() * 1000),
        level: 0,
      }),
    );

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

  getLevelForValue(value: number, thresholds: number[]): Level {
    if (value > thresholds[2]) {
      return 4 as Level;
    } else if (value > thresholds[1]) {
      return 3 as Level;
    } else if (value > thresholds[0]) {
      return 2 as Level;
    } else {
      return 1 as Level;
    }
  }
}
