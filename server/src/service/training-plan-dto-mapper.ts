import { TrainingPlan } from '../models/training/trainingPlan.js';
import { TrainingPlanCardViewDto } from '../models/dto/training-plan-card-view-dto.js';
import { TrainingPlanEditViewDto } from '../models/dto/training-plan-edit-view-dto.js';

export class TrainingPlanDtoMapper {
  /**
   * Returns a basic view of the training plan.
   * @param plan The full training plan.
   * @returns A basic view of the training plan.
   */
  static getCardView(plan: TrainingPlan): TrainingPlanCardViewDto {
    return {
      id: plan.id,
      title: plan.title,
      blockLength: plan.trainingWeeks.length,
      weightRecomamndationBase: plan.weightRecommandationBase,
      trainingFrequency: plan.trainingFrequency,
      lastUpdated: this.formatDate(new Date(plan.lastUpdated)),
      coverImageBase64: plan.coverImageBase64 ?? ''
    };
  }

  static getEditView(plan: TrainingPlan): TrainingPlanEditViewDto {
    return {
      id: plan.id,
      title: plan.title,
      trainingFrequency: plan.trainingFrequency,
      weightRecommandationBase: plan.weightRecommandationBase,
      trainingBlockLength: plan.trainingWeeks.length,
      coverImageBase64: plan.coverImageBase64 ?? ''
    };
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
