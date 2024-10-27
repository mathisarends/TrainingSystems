import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

/**
 * Service responsible for managing and interacting with the training plans and exercises data.
 * Provides methods to load training plans, load exercise data, and submit updated training plans.
 */
@Injectable()
export class TrainingViewService {
  private exerciseData: WritableSignal<ExerciseDataDTO | undefined> = signal(undefined);

  constructor(private httpService: HttpService) {}

  /**
   * Loads the training plan for a specific plan ID, week, and day.
   */
  loadTrainingPlan(planId: string, week: number, day: number): Observable<TrainingPlanDto> {
    return this.httpService.get<TrainingPlanDto>(`/training-plan-view/${planId}/${week}/${day}`);
  }

  /**
   * Loads the exercise data, using cached data if available.
   */
  loadExerciseData(): Observable<ExerciseDataDTO> {
    if (this.exerciseData()) {
      return of(this.exerciseData()!);
    }

    return this.httpService
      .get<ExerciseDataDTO>('/exercise')
      .pipe(tap((exerciseData) => this.exerciseData.set(exerciseData)));
  }

  /**
   * Submits changes to the training plan for a specific plan ID, week, and day.
   */
  submitTrainingPlan(planId: string, week: number, day: number, changedData: Record<string, string>): Observable<any> {
    return this.httpService.patch(`/training-plan-view/${planId}/${week}/${day}`, changedData);
  }
}
