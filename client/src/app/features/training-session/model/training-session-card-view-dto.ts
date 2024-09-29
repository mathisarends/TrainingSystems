export interface TrainingSessionCardViewDto {
  id: string;
  title: string;
  lastUpdated: Date;
  pictureUrl?: string;
  coverImageBase64?: string;
  averageTrainingDayDuration?: string;
}
