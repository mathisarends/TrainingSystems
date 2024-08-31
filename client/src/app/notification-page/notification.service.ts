import { Injectable } from '@angular/core';
import { HttpService } from '../../service/http/http-client.service';
import { Observable } from 'rxjs';
import { TrainingDayFinishedNotification } from '../usage-statistics/training-finished-notification';

/**
 * Service for handling notification-related operations.
 * This service provides methods to interact with the backend to retrieve training day notifications for the user.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private httpService: HttpService) {}

  /**
   * Retrieves the list of training day notifications for the user.
   */
  getTrainingDayNotifications(): Observable<TrainingDayFinishedNotification[]> {
    return this.httpService.get<TrainingDayFinishedNotification[]>('/user/training-notifications');
  }

  /**
   * Deletes a training day notification by ID.
   *
   * @param id - The ID of the notification to delete.
   * @returns An Observable representing the result of the delete operation.
   */
  deleteTrainingDayNotification(id: string): Observable<any> {
    return this.httpService.delete(`/user/training-notification/${id}`);
  }

  getTrainingDayById(id: string): Observable<any> {
    return this.httpService.get<any>(`/user/training-day/${id}`);
  }
}
