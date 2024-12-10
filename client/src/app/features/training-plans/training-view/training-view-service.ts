import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { TrainingPlanDto } from './trainingPlanDto';

/**
 * Service responsible for managing and interacting with the training plans and exercises data.
 * Provides methods to load training plans, load exercise data, and submit updated training plans.
 */
@Injectable({
  providedIn: 'root',
})
export class TrainingViewService {
  constructor(private httpService: HttpService) {}

  /**
   * Loads the training plan for a specific plan ID, week, and day.
   */
  loadTrainingPlan(planId: string, week: number, day: number): Observable<TrainingPlanDto> {
    return this.httpService.get<TrainingPlanDto>(`/training-plan-view/${planId}/${week}/${day}`);
  }

  /**
   * Submits changes to the training plan for a specific plan ID, week, and day.
   */
  submitTrainingPlan(planId: string, week: number, day: number, changedData: Record<string, string>): Observable<void> {
    return this.httpService.patch(`/training-plan-view/${planId}/${week}/${day}`, changedData);
  }
}
