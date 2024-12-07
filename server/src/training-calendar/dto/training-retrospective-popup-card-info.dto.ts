import { ExerciseCategoryComparisonDto } from './exercise-category-comparison.dto';

export interface TrainingRetrospectivePopupCardInfo {
  tonnageDifferenceFromLastWeek: number;
  durationDifferenceFromLastWeek: number;
  tonnageComparisonOverWeekSpan: ExerciseCategoryComparisonDto;
  tonnage: number;
  durationInMinutes: number;
}
