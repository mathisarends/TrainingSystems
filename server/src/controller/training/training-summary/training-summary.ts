import { TrainingDAyFinishedNotification } from '../../../models/collections/user/training-fninished-notifcation.js';

export interface TrainingSummary extends TrainingDAyFinishedNotification {
  trainingPlanTitle: string;
  trainingDayWeekNumber: number;
  trainingDayDayNumber: number;
}
