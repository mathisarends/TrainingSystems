import { Injectable } from '@angular/core';
import { HttpClientService } from '../../service/http-client.service';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { ExerciseDataDTO } from './exerciseDataDto';
import { TrainingPlanDto } from './trainingPlanDto';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  constructor(private httpClient: HttpClientService) {}

  async loadTrainingPlan(
    planId: string,
    week: number,
    day: number
  ): Promise<TrainingPlanDto> {
    try {
      return await firstValueFrom(
        this.httpClient.request<TrainingPlanDto>(
          HttpMethods.GET,
          `training/plan/${planId}/${week}/${day}`
        )
      );
    } catch (error) {
      console.error('Error loading training plan:', error);
      throw new Error('Error loading training plan');
    }
  }

  async loadExerciseData(): Promise<ExerciseDataDTO> {
    try {
      return await firstValueFrom(
        this.httpClient.request<ExerciseDataDTO>(
          HttpMethods.GET,
          'exercise/training'
        )
      );
    } catch (error) {
      console.error('Error loading exercise data:', error);
      throw new Error('Error loading exercise data');
    }
  }

  async submitTrainingPlan(
    planId: string,
    week: number,
    day: number,
    data: any
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          `training/plan/${planId}/${week}/${day}`,
          { body: data }
        )
      );
    } catch (error) {
      console.error('Error submitting training plan:', error);
      throw new Error('Error submitting training plan');
    }
  }
}
