import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { Observable } from 'rxjs/internal/Observable';
import { HttpService } from '../../core/services/http-client.service';

@Injectable()
export class StatisticsService {
  constructor(private httpService: HttpService) {}

  /**
   * Retrieves the titles of all available training plans.
   */
  getAllTrainingPlanTitles(): Observable<string[]> {
    return this.httpService.get(`/training/plans/titles`);
  }

  /**
   * Fetches the volume comparison data for the specified category and training plans.
   */
  getVolumeChartComparisonData(
    category: string,
    trainingPlanTitles: string[],
  ): Observable<Record<string, ChartDataDto>> {
    const requestParams = this.buildTrainingPlanComparisonRequestParams(category, trainingPlanTitles);
    return this.httpService.get(`/training/statistics/volume-comparison`, requestParams);
  }

  /**
   * Fetches the performance comparison data for the specified category and training plans.
   */
  getPerformanceChartComparisonData(
    category: string,
    trainingPlanTitles: string[],
  ): Observable<Record<string, ChartDataDto>> {
    const requestParams = this.buildTrainingPlanComparisonRequestParams(category, trainingPlanTitles);
    return this.httpService.get(`/training/statistics/performance-comparison`, requestParams);
  }

  /**
   * Builds the request parameters for comparing training plans based on category and titles.
   */
  private buildTrainingPlanComparisonRequestParams(category: string, trainingPlanTitles: string[]) {
    const trainingPlanTitlesQueryParam = trainingPlanTitles.join(',');

    return new HttpParams().set('category', category).set('plans', trainingPlanTitlesQueryParam);
  }
}
