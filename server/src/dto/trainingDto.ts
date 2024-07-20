import { TrainingPlan } from '../../../shared/models/training/trainingPlan.js';
import {
  DetailedTrainingPlanView,
  CustomTrainingPlanView,
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

  /**
   * Returns a detailed view of the training plan.
   * @param plan The full training plan.
   * @returns A detailed view of the training plan.
   */
  static getDetailedView(plan: TrainingPlan): DetailedTrainingPlanView {
    return plan;
  }

  /**
   * Returns a custom view of the training plan.
   * @param plan The full training plan.
   * @param fields The fields to include in the custom view.
   * @returns A custom view of the training plan.
   */
  static getCustomView<T extends keyof TrainingPlan>(plan: TrainingPlan, fields: T[]): CustomTrainingPlanView<T> {
    const customView: Partial<TrainingPlan> = {};
    fields.forEach(field => {
      customView[field] = plan[field];
    });
    return customView as CustomTrainingPlanView<T>;
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
