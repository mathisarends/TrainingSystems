import { TrainingPlanCardViewDto } from '../models/dto/training-plan-card-view-dto.js';
import { TrainingPlanEditViewDto } from '../models/dto/training-plan-edit-view-dto.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import dateService from './date-service.js';

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
      lastUpdatedString: dateService.formatDate(plan.lastUpdated),
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
}
