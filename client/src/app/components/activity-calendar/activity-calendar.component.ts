import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivityCalendarData } from '../../features/usage-statistics/activity-calendar-data';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { ActivityCalendarEntry, Day, Level } from './activity-calendar-entry';

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss'],
})
export class ActivityCalendar implements OnInit, AfterViewInit {
  @ViewChildren('month') months!: QueryList<ElementRef>;
  activityData = input.required<ActivityCalendarData>();
  grid: ActivityCalendarEntry[] = [];

  trainingDays = computed(() => Object.keys(this.activityData()).length);

  ngOnInit(): void {
    this.initializeGrid();

    const dataEntries = this.mapActivityDataToEntries();
    this.populateGrid(dataEntries);

    this.calculateLevels();
  }

  ngAfterViewInit(): void {
    this.scrollToCurrentMonth();
  }

  scrollToCurrentMonth(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const monthElement = this.months.get(currentMonth)!;
    monthElement.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }

  /**
   * Initializes the grid with default values for each day of the year.
   */
  private initializeGrid(): void {
    const startDayOfWeek = 0;

    this.grid = Array.from({ length: 364 }, (_, dayIndex) => {
      const dayOfWeek = (dayIndex + startDayOfWeek) % 7;
      const weekIndex = Math.floor(dayIndex / 7);
      return {
        day: dayIndex as 0 | 363,
        value: 0,
        level: 0 as Level,
        dayOfWeek: dayOfWeek,
        weekIndex: weekIndex,
      };
    });
  }

  /**
   * Maps the activity data from input to an array of grid entries.
   *
   * @returns An array of ActivityCalendarEntry objects mapped from the input data.
   */
  private mapActivityDataToEntries(): ActivityCalendarEntry[] {
    const startDayOfWeek = 0;

    return Object.entries(this.activityData()).map(([day, value]) => {
      const dayIndex = +day;
      const dayOfWeek = (dayIndex + startDayOfWeek) % 7;
      const weekIndex = Math.floor(dayIndex / 7);
      return {
        day: dayIndex as Day,
        value: value as number,
        level: 0 as Level,
        dayOfWeek: dayOfWeek,
        weekIndex: weekIndex,
      };
    });
  }

  /**
   * Populates the grid with activity data entries.
   *
   * @param dataEntries - The array of activity data entries to populate the grid.
   */
  private populateGrid(dataEntries: ActivityCalendarEntry[]): void {
    dataEntries.forEach((entry) => {
      this.grid[entry.day] = {
        day: entry.day as 0 | 363,
        value: entry.value,
        level: 0 as Level,
        dayOfWeek: entry.dayOfWeek,
        weekIndex: entry.weekIndex,
      };
    });
  }

  private calculateLevels() {
    const values = this.grid.map((item) => item.value);
    const nonZeroValues = values.filter((value) => value > 0);

    // Handle cases where we have very few non-zero values
    const quantileThresholds =
      nonZeroValues.length > 1 ? this.calculateQuantiles(nonZeroValues, [0.25, 0.5, 0.75]) : [0, 0, 0]; // Assign a default threshold

    this.grid.forEach((item) => {
      item.level = this.getLevelForValue(item.value, quantileThresholds);
    });
  }

  private calculateQuantiles(values: number[], quantiles: number[]): number[] {
    const sortedValues = values.sort((a, b) => a - b);

    if (sortedValues.length === 0) return [0, 0, 0];

    if (sortedValues.length < 4) {
      return this.handleFewValues(sortedValues);
    }

    return quantiles.map((quantile) => this.calculateThresholdForQuantile(sortedValues, quantile));
  }

  private getLevelForValue(value: number, quantileThresholds: number[]): Level {
    switch (true) {
      case value > quantileThresholds[2]:
        return 4 as Level;
      case value > quantileThresholds[1]:
        return 3 as Level;
      case value > quantileThresholds[0]:
        return 2 as Level;
      case value > 0:
        return 1 as Level;
      default:
        return 0 as Level;
    }
  }

  private calculateThresholdForQuantile(sortedValues: number[], quantile: number): number {
    const quantilePosition = (sortedValues.length - 1) * quantile;
    const lowerIndex = Math.floor(quantilePosition);
    const fractionalPart = quantilePosition - lowerIndex;

    if (sortedValues[lowerIndex + 1] !== undefined) {
      return sortedValues[lowerIndex] + fractionalPart * (sortedValues[lowerIndex + 1] - sortedValues[lowerIndex]);
    } else {
      return sortedValues[lowerIndex];
    }
  }

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
