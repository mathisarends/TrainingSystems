import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';
import { HttpService } from '../../../service/http/http-client.service';

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
    console.log('🚀 ~ TrainingViewService ~ submitTrainingPlan ~ changedData:', changedData);
    return this.httpClient.patch(`/training/plan/${planId}/${week}/${day}`, changedData);
  }
}
