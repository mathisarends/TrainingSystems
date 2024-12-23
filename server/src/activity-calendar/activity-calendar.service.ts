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

  private getIndexOfDayPerYearFromDate(date: Date): number {
    const dateObj = new Date(date);

    const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
    return Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  }
}
