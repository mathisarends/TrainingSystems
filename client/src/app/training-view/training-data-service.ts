import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingDataService {
  constructor(private http: HttpClient) {}

  async loadTrainingPlan(
    planId: string,
    week: number,
    day: number
  ): Promise<TrainingPlanDto> {
    // Uncomment the actual HTTP request once logging is verified
    return await firstValueFrom(
      this.http.request<TrainingPlanDto>(
        HttpMethods.GET,
        `api/training/plan/${planId}/${week}/${day}` // Make sure the API endpoint is correct
      )
    );
  }

  async loadExerciseData(): Promise<ExerciseDataDTO> {
    return await firstValueFrom(
      this.http.request<ExerciseDataDTO>(
        HttpMethods.GET,
        'api/exercise/training'
      ) // Make sure the API endpoint is correct
    );
  }

  async submitChanges(
    planId: string,
    week: number,
    day: number,
    changedData: any
  ): Promise<any> {
    return await firstValueFrom(
      this.http.request<any>(
        HttpMethods.PATCH,
        `api/training/plan/${planId}/${week}/${day}`, // Make sure the API endpoint is correct
        { body: changedData }
      )
    );
  }
}
