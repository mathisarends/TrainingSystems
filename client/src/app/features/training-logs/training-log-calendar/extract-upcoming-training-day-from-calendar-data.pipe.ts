import { Pipe, PipeTransform } from '@angular/core';
import { TrainingDayCalendarEntry } from './dto/training-day-calendar-entry';

@Pipe({
  name: 'extractTrainingDayFromCalendarData',
  standalone: true,
})
export class ExtractTrainingDayFromCalendarDataPipe implements PipeTransform {
  transform(
    day: number,
    month: number,
    year: number,
    upComingTrainings: TrainingDayCalendarEntry[],
  ): TrainingDayCalendarEntry | undefined {
    const dateToCheck = new Date(year, month, day);

    const trainingEntry = upComingTrainings.find((training) => {
      const trainingDate = new Date(training.trainingDate);
      return (
        trainingDate.getFullYear() === dateToCheck.getFullYear() &&
        trainingDate.getMonth() === dateToCheck.getMonth() &&
        trainingDate.getDate() === dateToCheck.getDate()
      );
    });

    return trainingEntry ?? undefined;
  }
}
