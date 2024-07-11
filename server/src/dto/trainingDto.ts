import { TrainingPlan } from '../models/training/trainingPlan.js';

// Utility Types for different views
export type BasicTrainingPlanView = Pick<TrainingPlan, 'title' | 'trainingFrequency' | 'trainingPhase' | 'lastUpdated'>;
export type DetailedTrainingPlanView = TrainingPlan;
export type MinimalTrainingPlanView = Pick<TrainingPlan, 'title' | 'lastUpdated'>;
export type CustomTrainingPlanView<T extends keyof TrainingPlan> = Pick<TrainingPlan, T>;

export class TrainingPlanDTO {
  /**
   * Returns a basic view of the training plan.
   * @param plan The full training plan.
   * @returns A basic view of the training plan.
   */
  static getBasicView(plan: TrainingPlan): BasicTrainingPlanView {
    return {
      title: plan.title,
      trainingFrequency: plan.trainingFrequency,
      trainingPhase: plan.trainingPhase,
      lastUpdated: plan.lastUpdated
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
   * Returns a minimal view of the training plan.
   * @param plan The full training plan.
   * @returns A minimal view of the training plan.
   */
  static getMinimalView(plan: TrainingPlan): MinimalTrainingPlanView {
    return {
      title: plan.title,
      lastUpdated: plan.lastUpdated
    };
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
