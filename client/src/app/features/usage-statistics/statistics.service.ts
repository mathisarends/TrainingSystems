import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpService } from '../../core/services/http-client.service';

@Injectable()
export class StatisticsService {
  constructor(private httpService: HttpService) {}

  getIdTitleMappingsForTrainingPlans(): Observable<string[]> {
    return this.httpService.get(`/training/plans/titles`);
  }
}
