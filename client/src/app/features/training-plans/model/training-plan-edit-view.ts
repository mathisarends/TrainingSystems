import { signal, WritableSignal } from '@angular/core';
import { TrainingPlanEditViewDto, WeightRecommendationBase } from '../edit-training-plan/training-plan-edit-view-dto';

/**
 * Class that represents a training plan with reactive properties using Angular Signals.
 */
export class TrainingPlanEditView {
  id: WritableSignal<string>;
  title: WritableSignal<string>;
  trainingFrequency: WritableSignal<number>;
  trainingBlockLength: WritableSignal<number>;
  weightRecommendationBase: WritableSignal<WeightRecommendationBase>;
  coverImageBase64: WritableSignal<string>;

  referencePlanId: WritableSignal<string | undefined> = signal(undefined);

  protected readonly defaultValues = {
    id: '',
    title: '',
    trainingFrequency: 4,
    trainingBlockLength: 4,
    weightRecommendationBase: WeightRecommendationBase.LASTWEEK,
    coverImageBase64: '',
  };

  /**
   * Make the constructor private to force usage of `setTrainingPlan`.
   */
  private constructor(dto?: TrainingPlanEditViewDto) {
    this.id = signal(this.defaultValues.id);
    this.title = signal(this.defaultValues.title);
    this.trainingFrequency = signal(this.defaultValues.trainingFrequency);
    this.trainingBlockLength = signal(this.defaultValues.trainingBlockLength);
    this.weightRecommendationBase = signal(this.defaultValues.weightRecommendationBase);
    this.coverImageBase64 = signal(this.defaultValues.coverImageBase64);

    // If DTO is provided, override the default values
    if (dto) {
      this.setTrainingPlan(dto);
    }
  }

  /**
   * Factory method to create a new instance of `TrainingPlan`.
   */
  static fromDto(dto?: TrainingPlanEditViewDto): TrainingPlanEditView {
    return new TrainingPlanEditView(dto);
  }

  /**
   * Convert the class back to a plain object for form submission.
   */
  toDto(): TrainingPlanEditViewDto {
    const dto: Partial<TrainingPlanEditViewDto> = {
      title: this.title(),
      trainingFrequency: this.trainingFrequency(),
      trainingBlockLength: this.trainingBlockLength(),
      weightRecommandationBase: this.weightRecommendationBase(),
      coverImageBase64: this.coverImageBase64(),
      referencePlanId: this.referencePlanId(),
    };

    if (this.id()) {
      dto.id = this.id();
    }

    return dto as TrainingPlanEditViewDto;
  }

  isValid(): boolean {
    return (
      this.title().trim().length > 0 &&
      !!this.trainingFrequency() &&
      !!this.trainingBlockLength() &&
      !!this.weightRecommendationBase()
    );
  }

  /**
   * Sets the training plan values from a DTO.
   */
  setTrainingPlan(dto: TrainingPlanEditViewDto): void {
    this.id.set(dto.id);
    this.title.set(dto.title);
    this.trainingFrequency.set(dto.trainingFrequency);
    this.trainingBlockLength.set(dto.trainingBlockLength);
    this.weightRecommendationBase.set(dto.weightRecommandationBase);
    this.coverImageBase64.set(dto.coverImageBase64 || this.defaultValues.coverImageBase64);
  }

  /**
   * Resets the training plan properties to default values, or uses provided values if given.
   * @param values Optional partial object to override default values.
   */
  resetToDefaults(): void {
    this.id.set(this.defaultValues.id);
    this.title.set(this.defaultValues.title);
    this.trainingFrequency.set(this.defaultValues.trainingFrequency);
    this.trainingBlockLength.set(this.defaultValues.trainingBlockLength);
    this.weightRecommendationBase.set(this.defaultValues.weightRecommendationBase);
    this.coverImageBase64.set(this.defaultValues.coverImageBase64);
  }

  setReferencePlanId(id: string): void {
    this.referencePlanId.set(id);
  }
}
