import { TrainingPlan } from "../../training/trainingPlan.js";

/**
 * Represents a basic view of a training plan.
 * Includes only the essential properties of a training plan.
 *
 * @typedef {Object} BasicTrainingPlanView
 * @property {string} id - The unique identifier of the training plan.
 * @property {string} title - The title of the training plan.
 * @property {number} trainingFrequency - The frequency of training sessions per week.
 * @property {Date} lastUpdated - The date when the training plan was last updated.
 */
export type BasicTrainingPlanView = Pick<
  TrainingPlan,
  "id" | "title" | "trainingFrequency" | "lastUpdated" | "coverImageBase64"
>;

export interface TrainingPlanCardView {
  id: string;
  title: string;
  trainingFrequency: number;
  lastUpdated: String;
  pictureUrl?: string; // profile picture of user
  coverImageBase64?: string;
}

/**
 * Represents a detailed view of a training plan.
 * Includes all properties of a training plan.
 *
 * @typedef {TrainingPlan} DetailedTrainingPlanView
 */
export type DetailedTrainingPlanView = TrainingPlan;

/**
 * Represents a custom view of a training plan.
 * Allows selection of specific properties of a training plan.
 *
 * @template T - The keys of the TrainingPlan to include in the view.
 * @typedef {Object} CustomTrainingPlanView
 * @property {T} - The selected properties of the training plan.
 */
export type CustomTrainingPlanView<T extends keyof TrainingPlan> = Pick<
  TrainingPlan,
  T
>;
