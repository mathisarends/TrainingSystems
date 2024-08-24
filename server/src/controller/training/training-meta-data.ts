import { User } from '../../models/collections/user/user';

export interface TrainingMetaData {
  user: User;
  trainingPlanIndex: number;
  trainingWeekIndex: number;
  trainingDayIndex: number;
}
