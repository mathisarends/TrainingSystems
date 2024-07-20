import { TrainingPlan } from '../../../shared/models/training/trainingPlan.js';
import {
  BasicTrainingPlanView,
  DetailedTrainingPlanView,
  CustomTrainingPlanView
} from '../../../shared/models/dtos/training/trainingDto.types.js';

export class TrainingPlanDTO {
  /**
   * Returns a basic view of the training plan.
   * @param plan The full training plan.
   * @returns A basic view of the training plan.
   */
  static getBasicView(plan: TrainingPlan): BasicTrainingPlanView {
    return {
      id: plan.id,
      title: plan.title,
      trainingFrequency: plan.trainingFrequency,
      lastUpdated: plan.lastUpdated,
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
}
