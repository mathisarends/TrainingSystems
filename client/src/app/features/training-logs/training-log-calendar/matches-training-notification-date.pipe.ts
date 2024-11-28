import { Pipe, PipeTransform } from '@angular/core';
import { TrainingDayFinishedNotificationDto } from '../../../shared/service/notification/training-day-finished-notification.dto';
import { TrainingDayCalendarEntry } from './dto/training-day-calendar-entry';

@Pipe({
  name: 'matchesTrainingNotification',
  standalone: true,
})
export class MatchesTrainingNotificationPipe implements PipeTransform {
  /**
   * Checks if a given `TrainingDayCalendarEntry` matches any notification in a list of `TrainingDayFinishedNotificationDto`.
   */
  transform(calendarEntry: TrainingDayCalendarEntry, notifications: TrainingDayFinishedNotificationDto[]): boolean {
    if (!calendarEntry || !notifications || notifications.length === 0) {
      return false;
    }

    return notifications.some(
      (notification) =>
        new Date(calendarEntry.trainingDate).toDateString() ===
        new Date(notification.trainingFinishedDate).toDateString(),
    );
  }
}
