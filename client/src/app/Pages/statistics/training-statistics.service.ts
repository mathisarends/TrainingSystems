import { Injectable } from '@angular/core';
import { HttpService } from '../../../service/http/http-client.service';
import { Observable } from 'rxjs';
import { TrainingExerciseTonnageDto } from './main-exercise-tonnage-dto';
import { TimeStats } from './time-stats';

@Injectable()
export class TrainingStatisticsService {
  constructor(private httpService: HttpService) {}

  /**
   * Retrieves a list of all exercise categories.
   */
  getAllCategories(): Observable<string[]> {
    return this.httpService.get<string[]>('/exercise/categories');
  }

  /**
   * Retrieves the list of categories that have been viewed by the user in a specific training plan.
   */
  getSelectedCategories(id: string): Observable<string[]> {
    return this.httpService.get<string[]>(`/training/statistics/${id}/viewedCategories`);
  }

  /**
   * Retrieves the tonnage data for selected exercises in a specific training plan.
   */
  getTonnageDataForSelectedExercises(
    id: string,
    exercises: string[],
  ): Observable<{
    title: string;
    data: Partial<TrainingExerciseTonnageDto>;
  }> {
    const exercisesQueryParam = this.toQueryParam(exercises);
    return this.httpService.get<any>(`/training/statistics/${id}?exercises=${exercisesQueryParam}`);
  }

  /**
   * Retrieves the set data for selected exercises in a specific training plan.
   */
  getSetDataForSelectedExercises(id: string, exercises: string[]) {
    const exercisesQueryParam = this.toQueryParam(exercises);
    return this.httpService.get<any>(`/training/statistics/${id}/sets?exercises=${exercisesQueryParam}`);
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

  // TODO: diesen Fetch hier ach wirklich benutzen
  /**
   * Retrieves time statistics for specific training days in a training plan.
   */
  getTimeStatsForTrainingDays(id: string): Observable<TimeStats> {
    return this.httpService.get(`/training/statistics/${id}/time`);
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
