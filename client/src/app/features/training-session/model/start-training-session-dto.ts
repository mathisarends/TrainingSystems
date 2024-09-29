import { TrainingDay } from '../../training-plans/training-view/training-day';

export interface StartTrainingVersionDto {
  trainingSessionTemplate: TrainingDay;
  version: number;
}
