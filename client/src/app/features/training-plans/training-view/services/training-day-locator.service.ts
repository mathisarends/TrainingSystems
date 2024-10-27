import { Injectable, signal } from '@angular/core';

@Injectable()
export class TrainingDayLocatorService {
  private _planId = signal('');
  private _trainingWeekIndex = signal(0);
  private _trainingDayIndex = signal(0);

  get planId(): string {
    return this._planId();
  }

  set planId(value: string) {
    this._planId.set(value);
  }

  get trainingWeekIndex(): number {
    return this._trainingWeekIndex();
  }

  set trainingWeekIndex(value: number) {
    this._trainingWeekIndex.set(value);
  }

  get trainingDayIndex(): number {
    return this._trainingDayIndex();
  }

  set trainingDayIndex(value: number) {
    this._trainingDayIndex.set(value);
  }
}
