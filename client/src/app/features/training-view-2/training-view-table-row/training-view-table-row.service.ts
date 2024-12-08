import { Injectable } from '@angular/core';
import { HttpService } from '../../../core/services/http-client.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';
import { TrainingDayLocatorService2 } from '../training-day-locator.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewTableRowService {
  constructor(
    private httpService: HttpService,
    private trainingDayLocatorService: TrainingDayLocatorService2,
  ) {}

  saveExercise(exercise: Exercise): Observable<Exercise> {
    const planId = this.trainingDayLocatorService.trainingPlanId();
    const weekIndex = this.trainingDayLocatorService.trainingWeekIndex();
    const dayIndex = this.trainingDayLocatorService.trainingDayIndex();

    return this.httpService.patch(`/training-plan-view/${planId}/${weekIndex}/${dayIndex}/2`, exercise);
  }
}
