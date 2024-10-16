import { TrainingDay } from '../../training/trainingDay.js';

export interface TrainingDayFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
  coverImage?: string;
  planTitle: string;
  tonnage: number;
}
