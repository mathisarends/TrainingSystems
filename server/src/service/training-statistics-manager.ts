import { ExerciseCategoryType } from '../models/training/exercise-category-type.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';

export abstract class TrainingStatisticsManager {
  protected trainingPlan: TrainingPlan;

  constructor(trainingPlan: TrainingPlan) {
    this.trainingPlan = trainingPlan;
  }

  protected mapExerciseCategoriesToValidCategoryTypes(exerciseCategories: string[]): ExerciseCategoryType[] {
    const mappedCategories = [];
    for (const category of exerciseCategories) {
      mappedCategories.push(this.mapToExerciseCategory(category));
    }
    return mappedCategories;
  }

  private mapToExerciseCategory(exerciseCategory: string): ExerciseCategoryType {
    switch (exerciseCategory.toLowerCase()) {
      case 'squat':
        return ExerciseCategoryType.SQUAT;
      case 'bench':
        return ExerciseCategoryType.BENCH;
      case 'deadlift':
        return ExerciseCategoryType.DEADLIFT;
      case 'overheadpress':
        return ExerciseCategoryType.OVERHEADPRESS;
      case 'chest':
        return ExerciseCategoryType.CHEST;
      case 'back':
        return ExerciseCategoryType.BACK;
      case 'shoulder':
        return ExerciseCategoryType.SHOULDER;
      case 'triceps':
        return ExerciseCategoryType.TRICEPS;
      case 'biceps':
        return ExerciseCategoryType.BICEPS;
      case 'legs':
        return ExerciseCategoryType.LEGS;
      default:
        throw new Error('Die übergebende Kategorie ist ungültig');
    }
  }
}
