import { Injectable } from '@nestjs/common';
import { AverageTrainingDayDurationDto } from 'src/training/dto/average-training-duration.dto';
import { TrainingPlan } from 'src/training/model/training-plan.model';

@Injectable()
export class SessionDurationService {
  private daysOfWeekLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  /**
   * Calculates the average session duration for each day of the week.
   */
  calculateAverageDurations(trainingPlan: TrainingPlan): AverageTrainingDayDurationDto[] {
    const trainingDaysWithDuration = this.getTrainingDaysWithDuration(trainingPlan);
    const dayOfWeekDurations = this.aggregateDurationByDayOfWeek(trainingDaysWithDuration);

    return Object.entries(dayOfWeekDurations)
      .filter(([, dayData]) => dayData.count > 0) // Filter out days with no training (count === 0)
      .map(([dayOfWeek, dayData]) => ({
        dayOfWeek: dayOfWeek,
        averageDuration: this.calculateAverage(dayData.totalDuration, dayData.count),
      }));
  }

  /**
   * Retrieves all training days that have a recorded duration.
   */
  private getTrainingDaysWithDuration(trainingPlan: TrainingPlan): { durationInMinutes: number; date: Date }[] {
    return trainingPlan.trainingWeeks
      .flatMap((week) => week.trainingDays)
      .filter((day) => !!day.durationInMinutes)
      .map((day) => ({
        durationInMinutes: day.durationInMinutes!,
        date: new Date(day.endTime!),
      }));
  }

  /**
   * Aggregates the total duration and count of training days by the day of the week.
   */
  private aggregateDurationByDayOfWeek(trainingDays: { durationInMinutes: number; date: Date }[]) {
    const dayOfWeekDurations: Record<string, { totalDuration: number; count: number }> = {
      Sonntag: { totalDuration: 0, count: 0 },
      Montag: { totalDuration: 0, count: 0 },
      Dienstag: { totalDuration: 0, count: 0 },
      Mittwoch: { totalDuration: 0, count: 0 },
      Donnerstag: { totalDuration: 0, count: 0 },
      Freitag: { totalDuration: 0, count: 0 },
      Samstag: { totalDuration: 0, count: 0 },
    };

    trainingDays.forEach((trainingDay) => {
      const dayOfWeek = this.daysOfWeekLabels[trainingDay.date.getDay()];
      dayOfWeekDurations[dayOfWeek].totalDuration += trainingDay.durationInMinutes;
      dayOfWeekDurations[dayOfWeek].count += 1;
    });

    return dayOfWeekDurations;
  }

  /**
   * Private method to calculate the average duration.
   */
  private calculateAverage(totalDuration: number, count: number): number {
    return totalDuration / count;
  }
}
