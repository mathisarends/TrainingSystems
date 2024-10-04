import _ from 'lodash';
import { ChartDataDto } from '../interfaces/chartDataDto.js';
import { ExerciseCategoryType } from '../models/training/exercise-category-type.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
const { capitalize } = _;

export class TrainingDayStatisticsManager {
  private trainingPlan: TrainingPlan;

  constructor(trainingPlan: TrainingPlan) {
    this.trainingPlan = trainingPlan;
  }

  getSetProgressionByCategories(exerciseCategories: string[]): ChartDataDto {
    const responseData: ChartDataDto = {};

    const mappedCategories = this.mapExerciseCategoriesToValidCategoryTypes(exerciseCategories);

    mappedCategories.forEach(category => {
      responseData[capitalize(category)] = this.getSetsPerWeek(category);
    });

    return responseData;
  }

  private getSetsPerWeek(exerciseCategory: ExerciseCategoryType): number[] {
    return this.trainingPlan.trainingWeeks.map(week =>
      week.trainingDays.reduce(
        (totalSets, trainingDay) =>
          totalSets +
          trainingDay.exercises
            .filter(exercise => exercise.category === exerciseCategory)
            .reduce((daySets, exercise) => daySets + exercise.sets, 0),
        0
      )
    );
  }

  private mapExerciseCategoriesToValidCategoryTypes(exerciseCategories: string[]): ExerciseCategoryType[] {
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
