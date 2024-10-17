import { TrainingDay } from '../../features/training-plans/training-view/training-day';

export interface TrainingDayFinishedNotification extends TrainingDay {
  trainingDayTonnage: number;
  coverImage?: string;
  planTitle: string;
}
