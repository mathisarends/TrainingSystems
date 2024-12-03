import { signal, WritableSignal } from '@angular/core';
import { CreateTrainingPlanDto } from './create-training-plan.dto';
import { TrainingPlanEditViewDto } from './training-plan-edit-view-dto';

/**
 * Represents a training plan during creation or editing modal group.
 */
export class TrainingPlanEditView {
  /**
   * Signal storing the unique identifier of the training plan. Only avaible in edit mode.
   */
  id: WritableSignal<string>;

  /**
   * Holds the title of the training plan.
   */
  title: WritableSignal<string>;

  /**
   * Holds a set of selected training days.
   */
  trainingDays: WritableSignal<Set<string>>;

  /**
   * Holds the length of the training block (in weeks).
   */
  trainingBlockLength: WritableSignal<number>;

  /**
   * Holds the cover image in Base64 format.
   */
  coverImageBase64: WritableSignal<string>;

  trainingTitleSuggestions = signal([
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
  ]);

  lastSuggestedTitle = signal('');

  startDate = signal(new Date());

  firstSelectableStartDate = signal('');

  /**
   * Default values for initializing a new training plan.
   */
  protected readonly defaultValues = {
    id: '',
    title: '',
    trainingDays: new Set<string>(['Mo', 'Mi', 'Fr']),
    trainingBlockLength: 4,
    coverImageBase64: '',
  };

  /**
   * Private constructor to enforce the use of the `fromDto` factory method.
   *
   * @param dto - Optional DTO to initialize the training plan.
   */
  private constructor(dto?: TrainingPlanEditViewDto, startDate?: string) {
    this.id = signal(this.defaultValues.id);
    this.title = signal(this.defaultValues.title);
    this.trainingDays = signal(this.defaultValues.trainingDays);
    this.trainingBlockLength = signal(this.defaultValues.trainingBlockLength);
    this.coverImageBase64 = signal(this.defaultValues.coverImageBase64);

    if (dto) {
      this.setTrainingPlan(dto);
    }

    if (startDate) {
      this.startDate.set(new Date(startDate));
      this.firstSelectableStartDate.set(this.formatDateForMinAttributeInDatepicker(startDate));
    }
  }

  /**
   * Factory method to create a new instance of `TrainingPlanEditView` from a DTO.
   *
   * @param dto - Optional DTO to initialize the training plan.
   * @returns A new instance of `TrainingPlanEditView`.
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
      title: this.title(),
      trainingDays: Array.from(this.trainingDays()),
      trainingBlockLength: Number(this.trainingBlockLength()),
      coverImageBase64: this.coverImageBase64(),
      id: this.id(),
      startDate: this.startDate().toISOString(),
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

  isTrainingBlockLengthValid(): boolean {
    return this.trainingBlockLength() >= 3 && this.trainingBlockLength() <= 8;
  }

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

  /**
   * Provides random training plan title suggestions.
   */
  getRandomTrainingPlanTitle(previousTitle: string | null = null): string {
    const filteredTitles = this.trainingTitleSuggestions().filter((title) => title !== previousTitle);

    const randomIndex = Math.floor(Math.random() * filteredTitles.length);
    return filteredTitles[randomIndex];
  }

  private formatDateForMinAttributeInDatepicker(date: Date | string): string {
    const isoDate = new Date(date);
    const year = isoDate.getFullYear();
    const month = ('0' + (isoDate.getMonth() + 1)).slice(-2);
    const day = ('0' + isoDate.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }
}
