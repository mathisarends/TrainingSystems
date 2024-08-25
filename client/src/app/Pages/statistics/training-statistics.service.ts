import { Injectable } from '@angular/core';
import { HttpService } from '../../../service/http/http-client.service';
import { Observable } from 'rxjs';
import { TrainingExerciseTonnageDto } from './main-exercise-tonnage-dto';

@Injectable()
export class TrainingStatisticsService {
  constructor(private httpService: HttpService) {}

  getAllCategories(): Observable<string[]> {
    return this.httpService.get<string[]>('/exercise/categories');
  }

  getSelectedCategories(id: string): Observable<string[]> {
    return this.httpService.get<string[]>(`/training/statistics/${id}/viewedCategories`);
  }

  getTonnageDataForSelectedExercises(
    id: string,
    exercises: string[],
  ): Observable<{
    title: string;
    data: Partial<TrainingExerciseTonnageDto>;
  }> {
    const exercisesQueryParam = this.toExercisesQueryParam(exercises);
    return this.httpService.get<any>(`/training/statistics/${id}?exercises=${exercisesQueryParam}`);
  }

  getSetDataForSelectedExercises(id: string, exercises: string[]) {
    const exercisesQueryParam = this.toExercisesQueryParam(exercises);
    return this.httpService.get<any>(`/training/statistics/${id}/sets?exercises=${exercisesQueryParam}`);
  }

  updateLastViewedCategories(id: string, exercises: string[]) {
    const exercisesQueryParam = this.toExercisesQueryParam(exercises);
    return this.httpService.post(`/training/statistics/${id}/viewedCategories?exercises=${exercisesQueryParam}`);
  }

  private toExercisesQueryParam(exercises: string[]) {
    return exercises.join(',');
  }
}
