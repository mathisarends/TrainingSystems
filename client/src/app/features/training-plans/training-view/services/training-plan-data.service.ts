import { Injectable, signal, WritableSignal } from '@angular/core';
import { TrainingDay } from '../training-day';
import { TrainingPlanDto } from '../trainingPlanDto';

// TODO: hier alles public machen
@Injectable()
export class TrainingPlanDataService {
  private _title: WritableSignal<string> = signal('');
  private _trainingFrequency: WritableSignal<number> = signal(0);
  private _trainingBlockLength: WritableSignal<number> = signal(0);
  trainingDay: WritableSignal<TrainingDay | undefined> = signal(undefined);
  private _weightRecommendations: WritableSignal<string[]> = signal([]);

  /**
   * Initializes the service state with data from a TrainingPlanDto object.
   * @param dto - The TrainingPlanDto containing data to initialize the service.
   */
  initializeFromDto(dto: TrainingPlanDto): void {
    this.title = dto.title;
    this.trainingFrequency = dto.trainingFrequency;
    this.trainingBlockLength = dto.trainingBlockLength;
    this.trainingDay.set(dto.trainingDay);
    this.weightRecommendations = dto.weightRecommandations;
  }

  get title(): string {
    return this._title();
  }

  set title(value: string) {
    this._title.set(value);
  }

  get trainingFrequency(): number {
    return this._trainingFrequency();
  }

  set trainingFrequency(value: number) {
    this._trainingFrequency.set(value);
  }

  get trainingBlockLength(): number {
    return this._trainingBlockLength();
  }

  set trainingBlockLength(value: number) {
    this._trainingBlockLength.set(value);
  }


  get weightRecommendations(): string[] {
    return this._weightRecommendations();
  }

  set weightRecommendations(value: string[]) {
    this._weightRecommendations.set(value);
  }
}
