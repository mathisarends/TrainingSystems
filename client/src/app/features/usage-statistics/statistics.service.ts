import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { HttpService } from '../../core/services/http-client.service';

@Injectable()
export class StatisticsService {
  constructor(private httpService: HttpService) {}

  private trainingPlansSource = new BehaviorSubject<string[]>([]);
  private selectedCategorySource = new BehaviorSubject<string>('');
  private selectedDataViewSource = new BehaviorSubject<string>('');

  trainingPlans$ = this.trainingPlansSource.asObservable();
  selectedCategory$ = this.selectedCategorySource.asObservable();
  selectedDataViewSource$ = this.selectedDataViewSource.asObservable();

  getIdTitleMappingsForTrainingPlans(): Observable<string[]> {
    return this.httpService.get(`/training/plans/titles`);
  }

  updateTrainingPlans(trainingPlans: string[]) {
    this.trainingPlansSource.next(trainingPlans);
  }

  updateSelectedCategory(category: string) {
    this.selectedCategorySource.next(category);
  }

  updateSelectedDataViewSource(dataView: string) {
    this.selectedCategorySource.next(dataView);
  }
}
