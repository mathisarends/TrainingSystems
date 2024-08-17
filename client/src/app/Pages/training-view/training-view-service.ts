import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../service/http/http-client.service';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpMethods } from '../../types/httpMethods';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewService {
  constructor(private httpClient: HttpClientService) {}

  loadTrainingPlan(planId: string, week: number, day: number): Observable<TrainingPlanDto> {
    return this.httpClient.request<TrainingPlanDto>(HttpMethods.GET, `training/plan/${planId}/${week}/${day}`);
  }

  loadExerciseData(): Observable<ExerciseDataDTO> {
    return this.httpClient.request<ExerciseDataDTO>(HttpMethods.GET, 'exercise');
  }

  submitTrainingPlan(planId: string, week: number, day: number, changedData: any): Observable<any> {
    return this.httpClient.request<any>(HttpMethods.PATCH, `training/plan/${planId}/${week}/${day}`, {
      body: changedData,
    });
  }
}
