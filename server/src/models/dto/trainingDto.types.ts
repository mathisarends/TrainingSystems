import { TrainingPlan } from '../training/trainingPlan.js';

export type BasicTrainingPlanView = Pick<
  TrainingPlan,
  'id' | 'title' | 'trainingFrequency' | 'lastUpdated' | 'coverImageBase64'
>;

export interface TrainingPlanCardView {
  id: string;
  title: string;
  trainingFrequency: number;
  lastUpdated: string;
  pictureUrl?: string; // profile picture of user
  coverImageBase64?: string;
}

export type DetailedTrainingPlanView = TrainingPlan;

export type CustomTrainingPlanView<T extends keyof TrainingPlan> = Pick<TrainingPlan, T>;
