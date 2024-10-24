import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

/**
 * Service responsible for managing and interacting with the training plans and exercises data.
 * Provides methods to load training plans, load exercise data, and submit updated training plans.
 */
@Injectable()
export class TrainingViewService {
  constructor(private httpClient: HttpService) {}

  /**
   * Loads the training plan for a specific plan ID, week, and day.
   */
  loadTrainingPlan(planId: string, week: number, day: number): Observable<TrainingPlanDto> {
    return this.httpClient.get<TrainingPlanDto>(`/training-plan-view/${planId}/${week}/${day}`);
  }

  /**
   * Loads the exercise data for the application.
   */
  loadExerciseData(): Observable<ExerciseDataDTO> {
    return this.httpClient.get<ExerciseDataDTO>('/exercise');
  }

  /**
   * Submits changes to the training plan for a specific plan ID, week, and day.
   */
  submitTrainingPlan(planId: string, week: number, day: number, changedData: Record<string, string>): Observable<any> {
    return this.httpClient.patch(`/training-plan-view/${planId}/${week}/${day}`, changedData);
  }
}
