/**
 * Represents the data structure for displaying a training plan in a card view.
 *
 * This interface defines the properties required to render a training plan overview,
 * including optional images.
 */
export interface TrainingPlanCardViewDto {
  id: string;
  title: string;
  trainingFrequency: number;
  lastUpdated: string;
  pictureUrl?: string;
  coverImageBase64?: string;
  percentageFinished?: number;
  averageTrainingDayDuration?: number;
}
