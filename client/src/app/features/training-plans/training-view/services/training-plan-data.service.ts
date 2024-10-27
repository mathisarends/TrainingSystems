import { Injectable } from '@angular/core';
import { TrainingPlanDto } from '../trainingPlanDto';

// TODO: Der hält auch einfach nur eine Referenz auf eine klasse das kann man auch weiter aufbröckeln, dass man das dto auch wirklich als dto verwendet.
@Injectable()
export class TrainingPlanDataService {
  trainingPlanData!: TrainingPlanDto;
}
