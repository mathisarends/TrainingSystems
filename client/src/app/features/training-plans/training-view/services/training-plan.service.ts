import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../../shared/dto/basic-confirmation-response';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanService {
  private trainingPlansChangedSubject = new Subject<void>();

  trainingPlansChanged$ = this.trainingPlansChangedSubject.asObservable();

  constructor(private httpClientService: HttpService) {}

  trainingPlanChanged() {
    this.trainingPlansChangedSubject.next();
  }

  reorderTrainingPlans(trainingPlanIds: string[]): Observable<BasicConfirmationResponse> {
    return this.httpClientService.post('/training/reorder', { updatedOrder: trainingPlanIds });
  }
}
