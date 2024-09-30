import { signal } from '@angular/core'; // Import signal
import { WeightRecommendationBase } from '../training-plans/edit-training-plan/training-plan-edit-view-dto';
import { TrainingDay } from '../training-plans/training-view/training-day';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingSessionDto } from './model/training-session-dto';
import { TrainingSessionMetaDataDto } from './training-session-meta-data-dto';

export class TrainingSession {
  id = signal<string>('');
  title = signal<string>('');
  lastUpdated = signal<Date>(new Date());
  weightRecommandationBase = signal<WeightRecommendationBase>(WeightRecommendationBase.LASTWEEK);
  versions = signal<TrainingDay[]>([]);
  coverImageBase64 = signal<string | undefined>(undefined);
  recentlyViewedCategoriesInStatisticSection = signal<string[] | undefined>(undefined);

  /**
   * Private constructor that initializes the TrainingSession instance from a DTO.
   * @param dto - The DTO containing data for initializing the training session.
   */
  private constructor(dto: TrainingSessionDto) {
    this.id.set(dto.id);
    this.title.set(dto.title);
    this.lastUpdated.set(dto.lastUpdated);
    this.weightRecommandationBase.set(dto.weightRecommandationBase);
    this.versions.set(dto.versions);
    this.coverImageBase64.set(dto.coverImageBase64);
    this.recentlyViewedCategoriesInStatisticSection.set(dto.recentlyViewedCategoriesInStatisticSection);
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
      weightRecommandationBase: this.weightRecommandationBase(),
      coverImageBase64: this.coverImageBase64(),
    };
  }

  getExercisesDataForVersion(version: number): Exercise[] {
    if (this.versions().length === 0) {
      return [];
    }

    return this.versions()[version].exercises;
  }
}
