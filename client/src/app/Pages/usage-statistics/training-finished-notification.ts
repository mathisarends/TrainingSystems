import { TrainingDay } from '../training-view/training-day';

export interface TrainingDayFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
  exerciseTabCollapsed: boolean;
}
