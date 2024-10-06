import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ChartDataDto } from '../../training-plans/training-plan-statistics/chart-data-dto';

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
    return this.httpService.get(`/training-session/statistics/tonnage/${id}`);
  }

  getPerformanceChartData(id: string, exercises: string[]): Observable<ChartDataDto> {
    return this.httpService.get(`/training-session/statistics/performance/${id}`);
  }
}
