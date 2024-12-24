import { signal } from '@angular/core';
import { CreateTrainingPlanDto } from './create-training-plan.dto';
import { TrainingPlanEditViewDto } from './training-plan-edit-view-dto';

/**
 * Represents a training plan during creation or editing modal group.
 */
export class TrainingPlanEditView {
  /**
   * Signal storing the unique identifier of the training plan. Only avaible in edit mode.
   */
  id = signal('');

  /**
   * Holds the title of the training plan.
   */
  title = signal('');

  /**
   * Holds a set of selected training days.
   */
  trainingDays = signal(new Set<string>(['Mo', 'Mi', 'Fr']));

  /**
   * Holds the length of the training block (in weeks).
   */
  trainingBlockLength = signal(4);

  /**
   * Holds the cover image in Base64 format.
   */
  coverImageBase64 = signal('');

  /**
   * Signal to store the starting date of the training plan.
   */
  startDate = signal(new Date());

  /**
   * Signal to store the earliest selectable start date for the date picker.
   */
  firstSelectableStartDate = signal('');

  /**
   * Private constructor to enforce the use of the `fromDto` factory method.
   */
  private constructor(dto?: TrainingPlanEditViewDto, startDate?: string) {
    if (dto) {
      this.setTrainingPlan(dto);
    }

    if (startDate) {
      this.startDate.set(new Date(startDate));
      this.firstSelectableStartDate.set(this.formatDateForMinAttributeInDatepicker(startDate));
    }
  }

  /**
   * Factory method to create a new instance of `TrainingPlanEditView` from a minimalistic first available start date.
   */
  static fromCreateDto(firstAvailableStartDate: string) {
    return new TrainingPlanEditView(undefined, firstAvailableStartDate);
  }

  /**
   * Factory method to create a new instance of `TrainingPlanEditView` from a DTO.
   */
  static fromDto(dto?: TrainingPlanEditViewDto, startDate?: string): TrainingPlanEditView {
    return new TrainingPlanEditView(dto, startDate);
  }

  /**
   * Convert the class back to a plain object for form submission.
   */
  toDto(): TrainingPlanEditViewDto {
    if (!this.id()) {
      throw new Error('ID is not defined use toCreateDto()-method instead');
    }

    return {
      id: this.id(),
      ...this.toCreateDto(),
    };
  }

  toCreateDto(): CreateTrainingPlanDto {
    return {
      title: this.title(),
      trainingDays: Array.from(this.trainingDays()),
      trainingBlockLength: Number(this.trainingBlockLength()),
      coverImageBase64: this.coverImageBase64(),
      startDate: this.startDate().toISOString(),
    };
  }

  /**
   * Checks if the training plan is valid.
   *
   * @returns `true` if the training plan is valid, otherwise `false`.
   */
  isValid(): boolean {
    return (
      this.title().trim().length > 0 &&
      !!this.trainingDays() &&
      this.isTrainingBlockLengthValid() &&
      this.isTrainingBlockLengthValid()
    );
  }

  /**
   * Checks if the training block length is within the valid range.
   */

  isTrainingBlockLengthValid(): boolean {
    return this.trainingBlockLength() >= 2 && this.trainingBlockLength() <= 8;
  }

  /**
   * Checks if the number of training days is within the valid range.
   */
  isTrainingFrequencyValid(): boolean {
    return this.trainingDays().size >= 2 && this.trainingDays().size <= 7;
  }

  /**
   * Sets the training plan values from a DTO.
   */
  setTrainingPlan(dto: TrainingPlanEditViewDto): void {
    this.id.set(dto.id);
    this.title.set(dto.title);
    this.trainingDays.set(new Set(dto.trainingDays));
    this.trainingBlockLength.set(dto.trainingBlockLength);
    this.coverImageBase64.set(dto.coverImageBase64 || '');
  }

  /**
   * Provides random training plan title suggestions.
   */
  getRandomTrainingPlanTitle(): string {
    const suggestions = [
      'Volume',
      'Strength',
      'Power',
      'Progression',
      'Peaking',
      'Intensity',
      'Deload',
      'Foundation',
      'Build',
      'Load',
      'Humble',
      'Recovery',
      'Push',
    ];

    const randomIndex = Math.floor(Math.random() * suggestions.length);
    return suggestions[randomIndex];
  }

  private formatDateForMinAttributeInDatepicker(date: Date | string): string {
    const isoDate = new Date(date);
    const year = isoDate.getFullYear();
    const month = ('0' + (isoDate.getMonth() + 1)).slice(-2);
    const day = ('0' + isoDate.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }
}
