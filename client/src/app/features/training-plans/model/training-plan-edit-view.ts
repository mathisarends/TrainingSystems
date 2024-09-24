import { signal, WritableSignal } from '@angular/core';
import { TrainingPlanEditViewDto, WeightRecommendationBase } from '../edit-training-plan/training-plan-edit-view-dto';

/**
 * Class that represents a training plan with reactive properties using Angular Signals.
 */
export class TrainingPlan {
  id: WritableSignal<string>;
  title: WritableSignal<string>;
  trainingFrequency: WritableSignal<number>;
  trainingBlockLength: WritableSignal<number>;
  weightRecommendationBase: WritableSignal<WeightRecommendationBase>;
  coverImageBase64: WritableSignal<string>;

  constructor(dto: TrainingPlanEditViewDto) {
    this.id = signal(dto.id);
    this.title = signal(dto.title);
    this.trainingFrequency = signal(dto.trainingFrequency);
    this.trainingBlockLength = signal(dto.trainingBlockLength);
    this.weightRecommendationBase = signal(dto.weightRecommandationBase);
    this.coverImageBase64 = signal(dto.coverImageBase64 || '');
  }

  /**
   * Convert the class back to a plain object for form submission.
   */
  toDto(): TrainingPlanEditViewDto {
    return {
      id: this.id(),
      title: this.title(),
      trainingFrequency: this.trainingFrequency(),
      trainingBlockLength: this.trainingBlockLength(),
      weightRecommandationBase: this.weightRecommendationBase(),
      coverImageBase64: this.coverImageBase64(),
    };
  }
}
