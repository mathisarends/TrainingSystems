import { signal, WritableSignal } from '@angular/core';
import { TrainingPlanEditViewDto, WeightRecommendationBase } from '../edit-training-plan/training-plan-edit-view-dto';

/**
 * Class that represents a training plan with reactive properties using Angular Signals.
 */
export class TrainingPlanEditView {
  id: WritableSignal<string>;
  title: WritableSignal<string>;
  trainingDays: WritableSignal<Set<string>>;
  trainingBlockLength: WritableSignal<number>;
  coverImageBase64: WritableSignal<string>;

  referencePlanId: WritableSignal<string | undefined> = signal(undefined);

  protected readonly defaultValues = {
    id: '',
    title: '',
    trainingDays: new Set<string>(['Mo', 'Mi', 'Fr']),
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
    this.trainingDays = signal(this.defaultValues.trainingDays);
    this.trainingBlockLength = signal(this.defaultValues.trainingBlockLength);
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
      trainingDays: Array.from(this.trainingDays()),
      trainingBlockLength: Number(this.trainingBlockLength()),
      coverImageBase64: this.coverImageBase64(),
    };

    if (this.id()) {
      dto.id = this.id();
    }

    return dto as TrainingPlanEditViewDto;
  }

  isValid(): boolean {
    return this.title().trim().length > 0 && !!this.trainingDays() && !!this.trainingBlockLength();
  }

  /**
   * Sets the training plan values from a DTO.
   */
  setTrainingPlan(dto: TrainingPlanEditViewDto): void {
    this.id.set(dto.id);
    this.title.set(dto.title);
    this.trainingDays.set(new Set(dto.trainingDays));
    this.trainingBlockLength.set(dto.trainingBlockLength);
    this.coverImageBase64.set(dto.coverImageBase64 || this.defaultValues.coverImageBase64);
  }

  /**
   * Resets the training plan properties to default values, or uses provided values if given.
   * @param values Optional partial object to override default values.
   */
  resetToDefaults(): void {
    this.id.set(this.defaultValues.id);
    this.title.set(this.defaultValues.title);
    this.trainingDays.set(this.defaultValues.trainingDays);
    this.trainingBlockLength.set(this.defaultValues.trainingBlockLength);
    this.coverImageBase64.set(this.defaultValues.coverImageBase64);
  }
}
