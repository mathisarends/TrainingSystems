import { Injectable } from '@angular/core';
import { HttpClientService } from '../../service/http-client.service';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewService {
  constructor(private httpClient: HttpClientService) {}

  async loadTrainingPlan(
    planId: string,
    week: number,
    day: number
  ): Promise<TrainingPlanDto> {
    return await firstValueFrom(
      this.httpClient.request<TrainingPlanDto>(
        HttpMethods.GET,
        `training/plan/${planId}/${week}/${day}`
      )
    );
  }

  async loadExerciseData(): Promise<ExerciseDataDTO> {
    return await firstValueFrom(
      this.httpClient.request<ExerciseDataDTO>(
        HttpMethods.GET,
        'exercise/training'
      )
    );
  }

  async submitTrainingPlan(
    planId: string,
    week: number,
    day: number,
    changedData: any
  ): Promise<any> {
    return await firstValueFrom(
      this.httpClient.request<any>(
        HttpMethods.PATCH,
        `training/plan/${planId}/${week}/${day}`,
        { body: changedData }
      )
    );
  }
}
