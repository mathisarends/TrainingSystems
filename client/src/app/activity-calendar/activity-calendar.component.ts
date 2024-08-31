import { Component, input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../service/tooltip/tooltip.directive';
import { ActivityCalendarEntry, Level } from './activity-calendar-entry';
import { ActivityCalendarData } from '../usage-statistics/activity-calendar-data';

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss'],
})
export class ActivityCalendar implements OnInit {
  activityData = input.required<ActivityCalendarData>();
  grid: ActivityCalendarEntry[] = [];

  trainingDays = computed(() => Object.keys(this.activityData()).length);

  ngOnInit(): void {
    const startDayOfWeek = 0;

    this.grid = Array.from({ length: 364 }, (_, index) => {
      const dayOfWeek = (index + startDayOfWeek) % 7;
      const weekIndex = Math.floor(index / 7);
      return {
        day: index as 0 | 363,
        value: 0,
        level: 0 as Level,
        dayOfWeek: dayOfWeek,
        weekIndex: weekIndex,
      };
    });

    const dataEntries = Object.entries(this.activityData()).map(([day, value]) => {
      const dayIndex = +day;
      const dayOfWeek = (dayIndex + startDayOfWeek) % 7;
      const weekIndex = Math.floor(dayIndex / 7);
      return {
        day: dayIndex,
        value: value as number,
        level: 0 as Level,
        dayOfWeek: dayOfWeek,
        weekIndex: weekIndex,
      };
    });

    dataEntries.forEach((entry) => {
      this.grid[entry.day] = {
        day: entry.day as 0 | 363,
        value: entry.value,
        level: 0 as Level,
        dayOfWeek: entry.dayOfWeek,
        weekIndex: entry.weekIndex,
      };
    });

    this.calculateLevels();
  }

  private calculateLevels() {
    const values = this.grid.map((item) => item.value);
    const filteredValues = values.filter((value) => value > 0);

    // Handle cases where we have very few non-zero values
    const thresholds =
      filteredValues.length > 1 ? this.calculateQuantiles(filteredValues, [0.25, 0.5, 0.75]) : [0, 0, 0]; // Assign a default threshold

    this.grid.forEach((item) => {
      item.level = this.getLevelForValue(item.value, thresholds);
    });
  }

  /**
   * Calculate the quantiles for a given array of values.
   * This method sorts the values and determines the thresholds for the given quantiles.
   *
   * @param values - The array of numeric values to calculate the quantiles from.
   * @param quantiles - The quantiles to calculate, e.g., [0.25, 0.5, 0.75].
   * @returns An array of numbers representing the calculated quantile thresholds.
   */
  private calculateQuantiles(values: number[], quantiles: number[]): number[] {
    const sortedValues = values.sort((a, b) => a - b);

    if (sortedValues.length === 0) return [0, 0, 0];

    if (sortedValues.length < 4) {
      return this.handleFewValues(sortedValues);
    }

    return quantiles.map((q) => this.calculateQuantile(sortedValues, q));
  }

  private getLevelForValue(value: number, thresholds: number[]): Level {
    switch (true) {
      case value > thresholds[2]:
        return 4 as Level;
      case value > thresholds[1]:
        return 3 as Level;
      case value > thresholds[0]:
        return 2 as Level;
      case value > 0:
        return 1 as Level;
      default:
        return 0 as Level;
    }
  }

  /**
   * Calculate a specific quantile value from a sorted array.
   *
   * @param sortedValues - The sorted array of numeric values.
   * @param quantile - The quantile to calculate (e.g., 0.25 for the first quartile).
   * @returns The calculated quantile value.
   */
  private calculateQuantile(sortedValues: number[], quantile: number): number {
    const pos = (sortedValues.length - 1) * quantile;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sortedValues[base + 1] !== undefined) {
      return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
    } else {
      return sortedValues[base];
    }
  }

  /**
   * Handles cases where there are fewer than 4 values to calculate quantiles.
   * @param sortedValues - The sorted array of values.
   * @returns Thresholds based on the few available values.
   */
  private handleFewValues(sortedValues: number[]): number[] {
    if (sortedValues.length === 1) {
      return [0, 0, sortedValues[0]];
    } else {
      return [
        sortedValues[0],
        sortedValues[Math.floor(sortedValues.length / 2)],
        sortedValues[sortedValues.length - 1],
      ];
    }
  }
}
