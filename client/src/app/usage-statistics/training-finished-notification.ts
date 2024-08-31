import { TrainingDay } from '../Pages/training-view/training-day';

export interface TrainingDayFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
  exerciseTabCollapsed: boolean;
}
