import { TrainingDay } from '../../training/trainingDay.js';

export interface TrainingDayFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
}
