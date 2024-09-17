import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/http-client.service';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

@Injectable()
export class TrainingViewService {
  constructor(private httpClient: HttpService) {}
  loadTrainingPlan(planId: string, week: number, day: number): Observable<TrainingPlanDto> {
    return this.httpClient.get<TrainingPlanDto>(`/training/plan/${planId}/${week}/${day}`);
  }

  loadExerciseData(): Observable<ExerciseDataDTO> {
    return this.httpClient.get<ExerciseDataDTO>('/exercise');
  }

  submitTrainingPlan(planId: string, week: number, day: number, changedData: Record<string, string>): Observable<any> {
    return this.httpClient.patch(`/training/plan/${planId}/${week}/${day}`, changedData);
  }
}
