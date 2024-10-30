import { Injectable } from '@angular/core';
import { ChartDataDto } from '@shared/charts/chart-data.dto';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';

@Injectable()
export class TrainingSessionStatisticsService {
  constructor(private httpService: HttpService) {}

  getTrainingSessiontitleById(id: string): Observable<string> {
    return this.httpService.get(`/training-routine/title/${id}`);
  }

  getTonnageChartData(id: string, exercises: string[]): Observable<ChartDataDto> {
    return this.httpService.get(`/training-routine-statistics/tonnage/${id}`);
  }

  getPerformanceChartData(id: string, exercises: string[]): Observable<ChartDataDto> {
    return this.httpService.get(`/training-routine-statistics/performance/${id}`);
  }
}
