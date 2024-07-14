import { TrainingDay } from '../../../../shared/models/training/trainingDay';

export interface TrainingPlanResponse {
  title: string;
  trainingFrequency: number;
  trainingBlockLength: number;
  trainingDay: TrainingDay;
}
