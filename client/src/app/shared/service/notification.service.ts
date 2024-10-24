import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { TrainingDayFinishedNotification } from '../../features/usage-statistics/training-finished-notification';

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
  trainingDayNotifications = signal<TrainingDayFinishedNotification[]>([]);

  amountOfUnseenNotifications = signal(0);

  constructor(private httpService: HttpService) {}

  /**
   * Fetches the training day notifications from the server and updates the `trainingDayNotifications` signal.
   * @returns An Observable of the fetched training day notifications.
   */
  fetchAndSetTrainingDayNotifications(): Observable<number> {
    return this.httpService.get<number>('/training-log/notifications').pipe(
      tap((amountOfUnseenNotifications: number) => {
        this.amountOfUnseenNotifications.set(amountOfUnseenNotifications);
      }),
    );
  }

  /**
   * Deletes a training day notification by ID and updates the `trainingDayNotifications` signal.
   *
   * @param id - The ID of the notification to delete.
   * @returns An Observable representing the result of the delete operation.
   */
  deleteTrainingDayNotification(id: string): Observable<any> {
    return this.httpService.delete(`/training-log/training-day/${id}`).pipe(
      tap(() => {
        // Remove the deleted notification from the signal
        const updatedNotifications = this.trainingDayNotifications().filter((notification) => notification.id !== id);
        this.trainingDayNotifications.set(updatedNotifications);
      }),
    );
  }

  /**
   * Fetches a specific training day by ID.
   *
   * @param id - The ID of the training day to fetch.
   * @returns An Observable of the fetched training day data.
   */
  getTrainingDayById(id: string): Observable<any> {
    return this.httpService.get<any>(`/training-log/training-day/${id}`);
  }
}
