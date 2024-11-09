import { Pipe, PipeTransform } from '@angular/core';
import { TrainingDayCalendarDataDto } from './dto/training-day-calendar-data.dto';

@Pipe({
  name: 'trainingLabel',
  standalone: true,
})
export class TrainingLabelPipe implements PipeTransform {
  transform(day: number, month: number, year: number, data: TrainingDayCalendarDataDto): string | null {
    const dateToCheck = new Date(year, month, day);

    const trainingEntry = [...data.finishedTrainings, ...data.upComingTrainings].find((training) => {
      const trainingDate = new Date(training.trainingDate);
      return (
        trainingDate.getFullYear() === dateToCheck.getFullYear() &&
        trainingDate.getMonth() === dateToCheck.getMonth() &&
        trainingDate.getDate() === dateToCheck.getDate()
      );
    });

    return trainingEntry ? trainingEntry.label : null;
  }
}
