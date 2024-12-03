import { Injectable, signal } from '@angular/core';

@Injectable()
export class TrainingDayLocatorService {
  planId = signal('');
  trainingWeekIndex = signal(0);
  trainingDayIndex = signal(0);
}
