import { TrainingPlan } from "../../training/trainingPlan.js";

// Utility Types for different views
export type BasicTrainingPlanView = Pick<
  TrainingPlan,
  "title" | "trainingFrequency" | "lastUpdated"
>;
export type DetailedTrainingPlanView = TrainingPlan;
export type MinimalTrainingPlanView = Pick<
  TrainingPlan,
  "title" | "lastUpdated"
>;
export type CustomTrainingPlanView<T extends keyof TrainingPlan> = Pick<
  TrainingPlan,
  T
>;
