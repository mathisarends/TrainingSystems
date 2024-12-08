import { Injectable, signal, Signal } from '@angular/core';

/**
 * Service for managing the training day context, including the current
 * training plan ID, week index, and day index. Provides read-only access
 * to these values and ensures controlled updates.
 */
@Injectable({
  providedIn: 'root',
})
export class TrainingDayLocatorService2 {
  private _trainingPlanId = signal('');
  private _trainingWeekIndex = signal(0);
  private _trainingDayIndex = signal(0);

  get trainingPlanId(): Signal<string> {
    return this._trainingPlanId;
  }

  get trainingWeekIndex(): Signal<number> {
    return this._trainingWeekIndex;
  }

  get trainingDayIndex(): Signal<number> {
    return this._trainingDayIndex;
  }

  initializeTrainingDayInformation(
    trainingPlanId: string,
    trainingPlanWeekIndex: number,
    trainingPlanDayIndex: number,
  ): void {
    this._trainingPlanId.set(trainingPlanId);
    this._trainingWeekIndex.set(trainingPlanWeekIndex);
    this._trainingDayIndex.set(trainingPlanDayIndex);
  }
}
