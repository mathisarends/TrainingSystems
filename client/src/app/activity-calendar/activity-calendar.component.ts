import { Component, input, Input, OnInit, signal, WritableSignal } from '@angular/core';
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
  /**
   * Input property to receive the training data from parent component.
   * Expects an object mapping day indices to tonnage or activity values.
   */
  activityData = input.required<ActivityCalendarData>();

  trainingDays = signal<number>(0);

  /**
   * The grid containing the activity data for each day of the year.
   * Each entry represents a day and its corresponding activity level and value.
   */
  grid: ActivityCalendarEntry[] = [];

  ngOnInit(): void {
    const startDayOfWeek = 0; // Assuming the year starts on a Monday (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)

    this.grid = Array.from({ length: 364 }, (_, index) => {
      const dayOfWeek = (index + startDayOfWeek) % 7; // Calculate the day of the week
      const weekIndex = Math.floor(index / 7); // Determine the week index
      return {
        day: index as 0 | 363,
        value: 0,
        level: 0 as Level,
        dayOfWeek: dayOfWeek,
        weekIndex: weekIndex, // Store the week index for alignment
      };
    });

    const dataEntries = Object.entries(this.activityData()).map(([day, value]) => {
      const dayIndex = +day; // Convert day string to number
      const dayOfWeek = (dayIndex + startDayOfWeek) % 7; // Calculate correct day of the week
      const weekIndex = Math.floor(dayIndex / 7); // Calculate correct week index
      return {
        day: dayIndex,
        value: value as number,
        level: 0 as Level,
        dayOfWeek: dayOfWeek,
        weekIndex: weekIndex,
      };
    });

    // Populate the grid with provided data
    dataEntries.forEach((entry) => {
      this.grid[entry.day] = {
        day: entry.day as 0 | 363,
        value: entry.value,
        level: 0 as Level,
        dayOfWeek: entry.dayOfWeek,
        weekIndex: entry.weekIndex,
      };
    });

    this.trainingDays.set(dataEntries.length);

    this.calculateLevels();
  }

  /**
   * Calculate the activity levels based on the value of each day.
   * The levels are determined using calculated quantiles, where the grid
   * entries are assigned a level from 1 to 4 based on their value.
   */
  calculateLevels() {
    const values = this.grid.map((item) => item.value);

    // Calculate quantiles
    const thresholds = this.calculateQuantiles(values, [0.25, 0.5, 0.75]);

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

  /**
   * Determine the activity level based on the value and calculated thresholds.
   *
   * @param value - The activity value for a specific day.
   * @param thresholds - The thresholds for each quantile to determine the level.
   * @returns The level corresponding to the value, ranging from 1 to 4.
   */
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
