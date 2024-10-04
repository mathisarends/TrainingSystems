import { ValidationError } from '../../errors/validationError.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';

export class TrainingPlanService {
  /**
   * Validates and retrieves a specific training day.
   */
  findAndValidateTrainingDay(trainingPlan: TrainingPlan, weekIndex: number, dayIndex: number): TrainingDay {
    if (isNaN(weekIndex) || isNaN(dayIndex)) {
      throw new ValidationError('Ungültige Parameter für die Trainingswoche oder den Trainingstag.');
    }

    if (weekIndex >= trainingPlan.trainingWeeks.length) {
      throw new ValidationError('Die angefragte Woche gibt es in dem angefragten Trainingsplan nicht.');
    }

    const trainingWeek = trainingPlan.trainingWeeks[weekIndex];
    if (dayIndex >= trainingWeek.trainingDays.length) {
      throw new ValidationError('Den nachgefragten Tag gibt es in dem angefragten Trainingsplan nicht.');
    }

    return trainingWeek.trainingDays[dayIndex];
  }
}
