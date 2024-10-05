import { TrainingDayFinishedNotification } from '../../../models/collections/user/training-fninished-notifcation.js';

export interface TrainingSummary extends TrainingDayFinishedNotification {
  trainingPlanTitle: string;
  trainingDayWeekNumber: number;
  trainingDayDayNumber: number;
}
