import { ChartDataDto } from 'shared/charts/chart-data.dto.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';
import { Exercise } from '../../models/training/exercise.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingWeek } from '../../models/training/trainingWeek.js';
import { TrainingStatisticsManager } from './training-statistics-manager.js';

import _ from 'lodash';
const { capitalize } = _;

export class TonnageProgressionManager extends TrainingStatisticsManager {
  getTonnageProgressionByCategories(exerciseCategories: string[]): ChartDataDto {
    const responseData: ChartDataDto = {};

    const mappedCategories = this.mapExerciseCategoriesToValidCategoryTypes(exerciseCategories);

    mappedCategories.forEach(category => {
      responseData[capitalize(category)] = this.prepareTonnageForExerciseCategory(category);
    });

    return responseData;
  }

  private prepareTonnageForExerciseCategory(exerciseCategory: ExerciseCategoryType): number[] {
    return this.trainingPlan.trainingWeeks
      .map(week => this.calculateTonnageForWeek(week, exerciseCategory))
      .filter((tonnage, index) => this.shouldIncludeWeek(tonnage, index));
  }

  private calculateTonnageForWeek(week: TrainingWeek, exerciseCategory: ExerciseCategoryType): number {
    let totalTonnageForWeek = 0;

    week.trainingDays.forEach(trainingDay => {
      totalTonnageForWeek += this.calculateTonnageForDayAndCategory(trainingDay, exerciseCategory);
    });

    return totalTonnageForWeek;
  }

  private calculateTonnageForDayAndCategory(trainingDay: TrainingDay, exerciseCategory: ExerciseCategoryType): number {
    let totalTonnageForDay = 0;

    trainingDay.exercises.forEach(exercise => {
      if (this.isMatchingCategory(exercise, exerciseCategory)) {
        totalTonnageForDay += this.calculateTonnageForExercise(exercise);
      }
    });

    return totalTonnageForDay;
  }

  private isMatchingCategory(exercise: Exercise, exerciseCategory: ExerciseCategoryType): boolean {
    return exercise.category === exerciseCategory;
  }

  private calculateTonnageForExercise(exercise: Exercise): number {
    const weight = parseFloat(exercise.weight) || 0;
    return exercise.sets * exercise.reps * weight;
  }

  /**
   * Bestimmt, ob eine Woche in die Endergebnisse eingeschlossen werden soll.
   * Wochen mit Tonnage 0 werden nur berücksichtigt, wenn sie die ersten beiden Wochen sind. Damit überhaupt ein Graph gezeichnet wird.
   */
  private shouldIncludeWeek(tonnage: number, index: number): boolean {
    const isInitialWeek = index === 0 || index === 1;
    const hasTonnage = tonnage > 0;

    return isInitialWeek || hasTonnage;
  }
}
