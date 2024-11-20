import { signal, WritableSignal } from '@angular/core'; // Import signal
import { TrainingDay } from '../training-plans/training-view/training-day';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingSessionDto } from './model/training-session-dto';
import { TrainingSessionMetaDataDto } from './training-session-meta-data-dto';

export class TrainingSession {
  id: WritableSignal<string>;
  title: WritableSignal<string>;
  lastUpdated = signal<Date>(new Date());
  versions: WritableSignal<TrainingDay[]>;
  coverImageBase64: WritableSignal<string>;
  recentlyViewedCategoriesInStatisticSection: WritableSignal<string[]>;

  protected readonly defaultValues = {
    id: '',
    title: '',
    trainingFrequency: 4,
    trainingBlockLength: 4,
    coverImageBase64: '',
    recentlyViewedCategoriesInStatisticSection: [],
  };

  /**
   * Private constructor that initializes the TrainingSession instance from a DTO.
   * @param dto - The DTO containing data for initializing the training session.
   */
  private constructor(dto: TrainingSessionDto) {
    this.id = signal(dto.id);
    this.title = signal(dto.title);
    this.lastUpdated.set(dto.lastUpdated);
    this.versions = signal(dto.versions);
    this.coverImageBase64 = signal(dto.coverImageBase64);
    this.recentlyViewedCategoriesInStatisticSection = signal(
      dto.recentlyViewedCategoriesInStatisticSection ?? this.defaultValues.recentlyViewedCategoriesInStatisticSection,
    );
  }

  /**
   * Static factory method to create a TrainingSession instance from a DTO.
   * @param dto - The DTO containing the session data.
   * @returns A new TrainingSession instance.
   */
  static fromDto(dto: TrainingSessionDto): TrainingSession {
    return new TrainingSession(dto);
  }

  /**
   * Converts the current session to a metadata DTO.
   * @returns A TrainingSessionMetaDataDto object containing the session metadata.
   */
  toSessionMetadataDto(): TrainingSessionMetaDataDto {
    return {
      title: this.title(),
      coverImageBase64: this.coverImageBase64(),
    };
  }

  getExercisesDataForVersion(version: number): Exercise[] {
    if (this.versions().length === 0) {
      return [];
    }

    return this.versions()[version - 1].exercises;
  }
}
