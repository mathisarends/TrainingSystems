import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanService {
  private trainingPlansChangedSubject = new Subject<void>();

  trainingPlansChanged$ = this.trainingPlansChangedSubject.asObservable();

  trainingPlanChanged() {
    this.trainingPlansChangedSubject.next();
  }
}
