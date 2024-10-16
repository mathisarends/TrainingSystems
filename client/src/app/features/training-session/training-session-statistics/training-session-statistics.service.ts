import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';

@Injectable()
export class TrainingSessionStatisticsService {
  constructor(private httpService: HttpService) {}

  getTrainingSessiontitleById(id: string): Observable<string> {
    return this.httpService.get(`/training-session/title/${id}`);
  }

  getExerciseOptions(id: string): Observable<string[]> {
    return this.httpService.get(`/training-session/statistics/exercises/${id}`);
  }

  getTonnageChartData(id: string, exercises: string[]): Observable<ChartDataDto> {
    const exerciseParams = this.buildExerciseRequestParams(exercises);

    return this.httpService.get(`/training-session/statistics/tonnage/${id}`, exerciseParams);
  }

  getPerformanceChartData(id: string, exercises: string[]): Observable<ChartDataDto> {
    const exerciseParams = this.buildExerciseRequestParams(exercises);

    return this.httpService.get(`/training-session/statistics/performance/${id}`, exerciseParams);
  }

  /**
   * Builds the request parameters for comparing training plans based on category and titles.
   */
  private buildExerciseRequestParams(exercises: string[]): HttpParams {
    const exercisesQuerParam = exercises.join(',');

    return new HttpParams().set('exercises', exercisesQuerParam);
  }
}
