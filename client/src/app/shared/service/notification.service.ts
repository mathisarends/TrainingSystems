import { DestroyRef, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { TrainingDayFinishedNotification } from '../../features/usage-statistics/training-finished-notification';
import { WebSocketService } from './web-socket.service';

/**
 * Service for handling notification-related operations.
 * This service provides methods to interact with the backend to retrieve training day notifications for the user.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private httpService: HttpService,
    private webSocketService: WebSocketService,
    private destroyRef: DestroyRef,
  ) {
    this.webSocketService
      .onMessage('message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        console.log('🚀 ~ NotificationService ~ this.webSocketService.onMessage ~ message:', message);
      });
  }

  /**
   * Signal holding the training day notifications for the user.
   */
  trainingDayNotifications = signal<TrainingDayFinishedNotification[]>([]);

  /**
   * Fetches the training day notifications from the server and updates the `trainingDayNotifications` signal.
   * @returns An Observable of the fetched training day notifications.
   */
  fetchAndSetTrainingDayNotifications(): Observable<TrainingDayFinishedNotification[]> {
    return this.httpService
      .get<TrainingDayFinishedNotification[]>('/user/activity/training-notifications')
      .pipe(
        tap((notifications: TrainingDayFinishedNotification[]) => this.trainingDayNotifications.set(notifications)),
      );
  }

  /**
   * Deletes a training day notification by ID and updates the `trainingDayNotifications` signal.
   *
   * @param id - The ID of the notification to delete.
   * @returns An Observable representing the result of the delete operation.
   */
  deleteTrainingDayNotification(id: string): Observable<any> {
    return this.httpService.delete(`/user/activity/training-notification/${id}`).pipe(
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
    return this.httpService.get<any>(`/user/activity/training-day/${id}`);
  }
}
