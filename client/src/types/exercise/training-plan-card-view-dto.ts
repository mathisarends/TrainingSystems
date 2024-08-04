export interface TrainingPlanCardView {
  id: string;
  title: string;
  trainingFrequency: number;
  lastUpdated: string;
  pictureUrl?: string; // profile picture of user
  coverImageBase64?: string;
}
