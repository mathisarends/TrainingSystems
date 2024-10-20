import { Injectable } from '@angular/core';
import { AverageTrainingDayDurationDto } from '@shared/charts/average-training-day-duration.dto';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ExerciseCategories } from '../model/exercise-categories';

@Injectable()
export class TrainingStatisticsService {
  constructor(private httpService: HttpService) {}

  getTrainingPlanTitle(id: string): Observable<string> {
    return this.httpService.get<string>(`/training/plan/${id}/title`);
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
    return this.httpService.get<ExerciseCategories[]>(`/training/statistics/${id}/viewedCategories`);
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getTonnageDataForSelectedExercises(id: string, exercises: string[]): Observable<ChartDataDto> {
    const exercisesQueryParam = this.toQueryParam(exercises);
    return this.httpService.get<ChartDataDto>(`/training/statistics/${id}?exercises=${exercisesQueryParam}`);
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getPerformanceDataForSelectedExercises(id: string, exercises: string[]): Observable<ChartDataDto> {
    const exercisesQueryParam = this.toQueryParam(exercises);
    return this.httpService.get<ChartDataDto>(
      `/training/statistics/${id}/performance?exercises=${exercisesQueryParam}`,
    );
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getAverageSessionDurationDataForTrainingPlanDay(id: string): Observable<AverageTrainingDayDurationDto[]> {
    return this.httpService.get<AverageTrainingDayDurationDto[]>(`/training/statistics/${id}/session-durations`);
  }

  /**
   * Retrieves the set data for selected exercises in a specific training plan.
   */
  getSetDataForSelectedExercises(id: string, exercises: string[]): Observable<ChartDataDto> {
    const exercisesQueryParam = this.toQueryParam(exercises);
    return this.httpService.get(`/training/statistics/${id}/sets?exercises=${exercisesQueryParam}`);
  }

  /**
   * Retrieves detailed drill-through data for a specific exercise category within a given week in a training plan.
   */
  getDrillThroughForSpecificExerciseCategory(id: string, exerciseName: string, weekNumber: number): Observable<any> {
    const weekIndex = weekNumber - 1;

    return this.httpService.get(`/training/statistics/${id}/drilldown/${exerciseName}/${weekIndex}`);
  }

  /**
   * Updates the list of categories that have been last viewed by the user in a specific training plan.
   */
  updateLastViewedCategories(id: string, exercises: string[]): Observable<unknown> {
    const exercisesQueryParam = this.toQueryParam(exercises);
    return this.httpService.post(`/training/statistics/${id}/viewedCategories?exercises=${exercisesQueryParam}`);
  }

  /**
   * Converts an array of exercise names into a query parameter string.
   *
   * @param exercises - An array of exercise names.
   * @returns A string that represents the query parameter for exercises.
   */
  private toQueryParam(exercises: string[]) {
    return exercises.join(',');
  }
}
