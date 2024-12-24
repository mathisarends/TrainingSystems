import { Injectable } from '@nestjs/common';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingPlan } from 'src/training/model/training-plan.model';

@Injectable()
export class ActivityCalendarService {
  getActivityCalendar(trainingPlans: TrainingPlan[], year: number) {
    const activityMap = trainingPlans
      .flatMap((plan) => plan.trainingWeeks)
      .flatMap((week) => week.trainingDays)
      .filter((day) => !!day.endTime && this.isInYear(day.endTime!, year))
      .reduce((map, day) => {
        const tonnagePerTrainingDay = this.getTonnagePerTrainingDay(day);
        const dayIndex = this.getIndexOfDayPerYearFromDate(day.endTime!);
        map.set(dayIndex, tonnagePerTrainingDay);
        return map;
      }, new Map<number, number>());

    return Object.fromEntries(activityMap);
  }

  private isInYear(date: Date, year: number): boolean {
    const dateObj = new Date(date);
    return dateObj.getFullYear() === year;
  }

  private getTonnagePerTrainingDay(trainingDay: TrainingDay): number {
    let tonnage = 0;

    for (const exercise of trainingDay.exercises) {
      const weight = Number(exercise.weight);

      if (isNaN(weight)) continue;

      const tonnagePerExercise = weight * exercise.sets * exercise.reps;
      tonnage += tonnagePerExercise;
    }

    return tonnage;
  }

  /**
   * Calculates the adjusted index of a day within a year.
   *
   * The index takes into account both the day of the year (starting from January 1st with index 0)
   * and the weekday on which the year starts (e.g., Monday = 1).
   *
   * @param date - The date for which the index should be calculated.
   * @returns The adjusted index of the day within the year (0-based, shifted by the start weekday of the year).
   */
  private getIndexOfDayPerYearFromDate(date: Date): number {
    const dateObj = new Date(date);

    const startOfYear = new Date(dateObj.getFullYear(), 0, 1);

    const startOfYearIndex = startOfYear.getDay();

    const dayOfYearIndex = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

    return dayOfYearIndex + startOfYearIndex;
  }
}
