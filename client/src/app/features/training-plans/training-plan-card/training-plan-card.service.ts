import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class TrainingPlanCardService {
  private baseUrl = '/training';

  constructor(private httpClient: HttpClient) {}

  /**
   * Fetch the latest training plan data by ID.
   * @param id The ID of the training plan.
   * @returns Observable containing the latest training plan data.
   */
  getLatestTrainingPlan(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/plan/${id}/latest`);
  }

  /**
   * Delete a training plan by ID.
   * @param id The ID of the training plan to delete.
   * @returns Observable of the delete operation result.
   */
  deleteTrainingPlan(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}
