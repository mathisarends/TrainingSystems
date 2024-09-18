import { Injectable } from '@angular/core';
import { TrainingPlanDto } from '../trainingPlanDto';

@Injectable()
export class TrainingPlanDataService {
  trainingPlanData!: TrainingPlanDto;
}
