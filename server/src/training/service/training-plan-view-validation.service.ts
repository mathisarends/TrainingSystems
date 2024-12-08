import { BadRequestException, Injectable } from '@nestjs/common';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingWeek } from '../model/training-week.schema';

@Injectable()
export class TrainingPlanViewValidationService {
  /**
   * Retrieves the training day view for a given plan and user.
   */
  findAndValidateTrainingDay(trainingPlan: TrainingPlan, weekIndex: number, dayIndex: number): TrainingDay {
    const trainingWeek = this.getValidatedTrainingWeek(trainingPlan, weekIndex);
    return this.getValidatedTrainingDay(trainingWeek, dayIndex);
  }

  /**
   * Validates the training week based on index.
   */
  private getValidatedTrainingWeek(trainingPlan: TrainingPlan, weekIndex: number) {
    if (weekIndex >= trainingPlan.trainingWeeks.length) {
      throw new BadRequestException('Week index is not valid');
    }
    return trainingPlan.trainingWeeks[weekIndex];
  }

  /**
   * Validates the training day based on index.
   */
  private getValidatedTrainingDay(trainingWeek: TrainingWeek, dayIndex: number): TrainingDay {
    if (dayIndex >= trainingWeek.trainingDays.length) {
      throw new BadRequestException('Day index is not valid');
    }
    return trainingWeek.trainingDays[dayIndex];
  }
}
