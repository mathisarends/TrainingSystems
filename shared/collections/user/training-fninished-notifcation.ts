import { TrainingDay } from '../../training/trainingDay.js';

export interface TrainingDAyFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
}
