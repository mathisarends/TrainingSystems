import { TrainingPlan } from './trainingPlan.js';

export type BasicTrainingPlanView = Pick<
  TrainingPlan,
  'id' | 'title' | 'trainingFrequency' | 'lastUpdated' | 'coverImageBase64'
>;
