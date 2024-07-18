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

  // for now errors are expected because headers are not send everytime a request ist made
  async loadExerciseData(): Promise<ExerciseDataDTO | null> {
    try {
      return await firstValueFrom(
        this.httpClient.request<ExerciseDataDTO>(
          HttpMethods.GET,
          'exercise/training'
        )
      );
    } catch (error) {
      return null;
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
