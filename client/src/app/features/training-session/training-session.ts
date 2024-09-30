import { signal } from '@angular/core'; // Import signal
import { WeightRecommendationBase } from '../training-plans/edit-training-plan/training-plan-edit-view-dto';
import { Exercise } from '../training-plans/training-view/training-exercise';
import { TrainingSessionDto } from './model/training-session-dto';
import { TrainingSessionMetaDataDto } from './training-session-meta-data-dto';

export class TrainingSession {
  id = signal<string>('');
  title = signal<string>('');
  lastUpdated = signal<Date>(new Date());
  weightRecommandationBase = signal<WeightRecommendationBase>(WeightRecommendationBase.LASTWEEK);
  trainingDays = signal<Exercise[]>([]);
  coverImageBase64 = signal<string | undefined>(undefined);
  recentlyViewedCategoriesInStatisticSection = signal<string[] | undefined>(undefined);

  // Private constructor
  private constructor(dto: TrainingSessionDto) {
    console.log('🚀 ~ TrainingSession ~ constructor ~ dto:', dto);
    this.id.set(dto.id);
    this.title.set(dto.title);
    this.lastUpdated.set(dto.lastUpdated);
    this.weightRecommandationBase.set(dto.weightRecommandationBase);
    this.trainingDays.set(dto.trainingDays);
    this.coverImageBase64.set(dto.coverImageBase64);
    this.recentlyViewedCategoriesInStatisticSection.set(dto.recentlyViewedCategoriesInStatisticSection);
  }

  // Static method to create an instance from a DTO
  static fromDto(dto: TrainingSessionDto): TrainingSession {
    return new TrainingSession(dto);
  }

  // Maps to an editable view model for the UI
  toSessionMetadataDto(): TrainingSessionMetaDataDto {
    return {
      title: this.title(),
      weightRecommandationBase: this.weightRecommandationBase(),
      coverImageBase64: this.coverImageBase64(),
    };
  }
}
