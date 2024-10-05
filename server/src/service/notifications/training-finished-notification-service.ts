import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { getTonnagePerTrainingDay } from '../trainingService.js';

export class TrainingDayFinishedNotificationService {
  static toTrainingFinishedNotificationDto(trainingDay: TrainingDay): TrainingDayFinishedNotification {
    return {
      ...trainingDay,
      trainingDayTonnage: getTonnagePerTrainingDay(trainingDay)
    };
  }
}
