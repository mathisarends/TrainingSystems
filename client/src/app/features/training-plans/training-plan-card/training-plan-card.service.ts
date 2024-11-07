import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';

@Injectable()
export class TrainingPlanCardService {
  constructor(private httpService: HttpService) {}

  /**
   * Fetch the latest training plan data by ID.
   * @param id The ID of the training plan.
   * @returns Observable containing the latest training plan data.
   */
  getLatestTrainingPlan(id: string): Observable<any> {
    return this.httpService.get<any>(`/training/${id}/latest`);
  }

  /**
   * Delete a training plan by ID.
   * @param id The ID of the training plan to delete.
   * @returns Observable of the delete operation result.
   */
  deleteTrainingPlan(id: string): Observable<void> {
    return this.httpService.delete(`/training/${id}`);
  }
}
