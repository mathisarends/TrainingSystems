import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { TrainingDayFinishedNotificationDto } from './training-day-finished-notification.dto';

/**
 * Service for handling notification-related operations.
 * This service provides methods to interact with the backend to retrieve training day notifications for the user.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Signal holding the training day notifications for the user.
   */
  trainingDayNotifications = signal<TrainingDayFinishedNotificationDto[]>([]);

  amountOfUnseenNotifications = computed(() => this.trainingDayNotifications.length);

  constructor(private httpService: HttpService) {}

  /**
   * Fetches the training day notifications from the server and updates the `trainingDayNotifications` signal.
   * @returns An Observable of the fetched training day notifications.
   */
  fetchAndSetTrainingDayNotifications(): Observable<TrainingDayFinishedNotificationDto[]> {
    return this.httpService.get<TrainingDayFinishedNotificationDto[]>('/training-log/notifications').pipe(
      tap((trainingDayFinishedNotifications: TrainingDayFinishedNotificationDto[]) => {
        this.trainingDayNotifications.set(trainingDayFinishedNotifications);
      }),
    );
  }

  /**
   * Deletes a training day notification by ID and updates the `trainingDayNotifications` signal.
   *
   * @param id - The ID of the notification to delete.
   */
  deleteTrainingDayNotification(): Observable<any> {
    return this.httpService.delete('/training-log/notifications').pipe(
      tap(() => {
        this.trainingDayNotifications.set([]);
      }),
    );
  }
}
