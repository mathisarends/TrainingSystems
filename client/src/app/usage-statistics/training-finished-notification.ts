import { TrainingDay } from '../Pages/training-view/training-day';

export interface TrainingDAyFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
}
