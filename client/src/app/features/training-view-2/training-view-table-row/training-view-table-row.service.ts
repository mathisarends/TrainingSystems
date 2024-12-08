import { Injectable } from '@angular/core';
import { HttpService } from '../../../core/services/http-client.service';
import { Exercise } from '../../training-plans/training-view/training-exercise';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewTableRowService {
  constructor(
    private httpService: HttpService,
    private trainingDayLocatorService: TrainingViewTableRowService,
  ) {}

  saveExercise(exercise: Exercise): void {}
}
