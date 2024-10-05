import { ValidationError } from '../../errors/validationError.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import { TrainingDayDto } from './dto/training-day-dto.js';

export class TrainingPlanService {
  private trainingPlan: TrainingPlan;

  constructor(trainingPlan: TrainingPlan) {
    this.trainingPlan = trainingPlan;
  }

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

    const trainingWeek = this.trainingPlan.trainingWeeks[weekIndex];
    if (dayIndex >= trainingWeek.trainingDays.length) {
      throw new ValidationError('Den nachgefragten Tag gibt es in dem angefragten Trainingsplan nicht.');
    }

    return trainingWeek.trainingDays[dayIndex];
  }

  toTrainingDayDto(trainingDay: TrainingDay, weightRecommandations: string[]): TrainingDayDto {
    return {
      title: this.trainingPlan.title,
      trainingFrequency: this.trainingPlan.trainingFrequency,
      trainingBlockLength: this.trainingPlan.trainingWeeks.length,
      trainingDay,
      weightRecommandations
    };
  }
}
