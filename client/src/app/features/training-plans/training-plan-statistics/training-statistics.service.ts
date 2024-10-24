import { Injectable } from '@angular/core';
import { AverageTrainingDayDurationDto } from '@shared/charts/average-training-day-duration.dto';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ExerciseCategories } from '../model/exercise-categories';

@Injectable()
export class TrainingStatisticsService {
  constructor(private httpService: HttpService) {}

  getTrainingPlanTitle(id: string): Observable<{ title: string }> {
    return this.httpService.get(`/training/title/${id}`);
  }

  /**
   * Retrieves a list of all exercise categories.
   */
  getAllCategories(): Observable<ExerciseCategories[]> {
    return this.httpService.get<ExerciseCategories[]>('/exercise/categories');
  }

  /**
   * Retrieves the list of categories that have been viewed by the user in a specific training plan.
   */
  getSelectedCategories(id: string): Observable<ExerciseCategories[]> {
    return this.httpService.get<ExerciseCategories[]>(`/training-plan/statistics/viewedCategories/${id}`);
  }

  /**
   * Updates the list of categories that have been last viewed by the user in a specific training plan.
   */
  updateLastViewedCategories(id: string, categpries: string[]): Observable<unknown> {
    const categoriesQueryParam = this.toQueryParam(categpries);
    return this.httpService.post(`/training-plan/statistics/viewedCategories/${id}?categories=${categoriesQueryParam}`);
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getTonnageDataForSelectedExercises(id: string, categpries: string[]): Observable<ChartDataDto> {
    const categoriesQueryParam = this.toQueryParam(categpries);
    return this.httpService.get<ChartDataDto>(
      `/training-plan/statistics/${id}/volume?categories=${categoriesQueryParam}`,
    );
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getPerformanceDataForSelectedExercises(id: string, categpries: string[]): Observable<ChartDataDto> {
    const categoriesQueryParam = this.toQueryParam(categpries);
    return this.httpService.get<ChartDataDto>(
      `/training-plan/statistics/${id}/performance?categories=${categoriesQueryParam}`,
    );
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getAverageSessionDurationDataForTrainingPlanDay(id: string): Observable<AverageTrainingDayDurationDto[]> {
    return this.httpService.get<AverageTrainingDayDurationDto[]>(`/training-plan/statistics/${id}/session-durations`);
  }

  /**
   * Retrieves the set data for selected exercises in a specific training plan.
   */
  getSetDataForSelectedExercises(id: string, categpries: string[]): Observable<ChartDataDto> {
    const categoriesQueryParam = this.toQueryParam(categpries);
    return this.httpService.get(`/training-plan/statistics/${id}/sets?categories=${categoriesQueryParam}`);
  }

  /**
   * Converts an array of exercise names into a query parameter string.
   *
   * @param categpries - An array of exercise names.
   * @returns A string that represents the query parameter for exercises.
   */
  private toQueryParam(categpries: string[]) {
    return categpries.join(',');
  }
}
