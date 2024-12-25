import { Injectable, signal } from '@angular/core';
import { BodyWeightGoal } from '../body-weight-goal.enum';

@Injectable({
  providedIn: 'root',
})
export class BodyWeightConfigurationService {
  bodyWeightGoal = signal(BodyWeightGoal.GAIN);

  bodyWeightRate = signal(0.25);
}
