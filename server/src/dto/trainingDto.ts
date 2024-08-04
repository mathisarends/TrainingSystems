import { TrainingPlan } from '../../../shared/models/training/trainingPlan.js';
import {
  DetailedTrainingPlanView,
  TrainingPlanCardView
} from '../../../shared/models/dtos/training/trainingDto.types.js';

export class TrainingPlanDTO {
  /**
   * Returns a basic view of the training plan.
   * @param plan The full training plan.
   * @returns A basic view of the training plan.
   */
  static getBasicView(plan: TrainingPlan): TrainingPlanCardView {
    return {
      id: plan.id,
      title: plan.title,
      trainingFrequency: plan.trainingFrequency,
      lastUpdated: this.formatDate(new Date(plan.lastUpdated)),
      coverImageBase64: plan.coverImageBase64 ?? ''
    };
  }

  static getEditView(plan: TrainingPlan): Partial<TrainingPlan> {
    return {
      id: plan.id,
      title: plan.title,
      trainingFrequency: plan.trainingFrequency,
      weightRecommandationBase: plan.weightRecommandationBase,
      trainingWeeks: plan.trainingWeeks,
      coverImageBase64: plan.coverImageBase64 ?? ''
    };
  }

  /**
   * Returns a detailed view of the training plan.
   * @param plan The full training plan.
   * @returns A detailed view of the training plan.
   */
  static getDetailedView(plan: TrainingPlan): DetailedTrainingPlanView {
    return plan;
  }

  /**
   * Formats a date to 'dd.mm.yyyy, hh:mm' format.
   * @param date The date to format.
   * @returns The formatted date string.
   */
  static formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('de-DE', options).format(date);
  }
}
