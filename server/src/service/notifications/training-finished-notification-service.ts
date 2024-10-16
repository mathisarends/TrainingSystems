import { TrainingDayFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { getTonnagePerTrainingDay } from '../trainingService.js';

// TODO: alles was hiermit related ist muss gelöscht werden (es muss keine ganze trainingsbeanchrichtigung mehr geschrieben werdne)
export class TrainingDayFinishedNotificationService {
  static toTrainingFinishedNotificationDto(trainingDay: TrainingDay): TrainingDayFinishedNotification {
    return {
      ...trainingDay,
      planTitle: '',
      tonnage: 0,
      trainingDayTonnage: getTonnagePerTrainingDay(trainingDay)
    };
  }
}
