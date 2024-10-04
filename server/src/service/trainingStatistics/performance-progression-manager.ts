import _ from 'lodash';
import { ChartDataDto } from '../../interfaces/chartDataDto.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';
import { Exercise } from '../../models/training/exercise.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { TrainingWeek } from '../../models/training/trainingWeek.js';
import { TrainingStatisticsManager } from './training-statistics-manager.js';

const { capitalize } = _;

export class PerformanceProgressionManager extends TrainingStatisticsManager {
  private mainExercises = [
    ExerciseCategoryType.SQUAT,
    ExerciseCategoryType.BENCH,
    ExerciseCategoryType.DEADLIFT,
    ExerciseCategoryType.OVERHEADPRESS
  ];

  public getPerformanceProgressionByCategories(exerciseCategories: string[]): ChartDataDto {
    const mappedCategories = this.mapExerciseCategoriesToValidCategoryTypes(exerciseCategories);
    const validExercises = mappedCategories.filter(exercise => this.mainExercises.includes(exercise));

    const responseData = validExercises.reduce((result, category) => {
      result[capitalize(category)] = this.getBestPerformanceByExercise(category);
      return result;
    }, {} as ChartDataDto);

    return responseData;
  }

  /**
   * Calculates the best performance per exercise category over the weeks.
   */
  private getBestPerformanceByExercise(exerciseCategory: ExerciseCategoryType): number[] {
    return this.trainingPlan.trainingWeeks
      .map((week, index) => {
        const bestPerformance = this.getBestPerformanceForWeek(week, exerciseCategory);
        return { bestPerformance, index };
      })
      .filter(weekData => this.shouldIncludeWeek(weekData.bestPerformance, weekData.index))
      .map(weekData => weekData.bestPerformance);
  }

  /**
   * Calculates the best performance in a week for a given exercise category.
   */
  private getBestPerformanceForWeek(week: TrainingWeek, exerciseCategory: ExerciseCategoryType): number {
    let bestPerformance = 0;

    week.trainingDays.forEach(trainingDay => {
      bestPerformance = Math.max(bestPerformance, this.getBestPerformanceForDay(trainingDay, exerciseCategory));
    });

    return bestPerformance;
  }

  /**
   * Calculates the best performance on a training day for a specific exercise category.
   */
  private getBestPerformanceForDay(trainingDay: TrainingDay, exerciseCategory: ExerciseCategoryType): number {
    let bestPerformance = 0;

    trainingDay.exercises.forEach((exercise: Exercise) => {
      if (exercise.category === exerciseCategory && exercise.estMax) {
        bestPerformance = Math.max(bestPerformance, exercise.estMax);
      }
    });

    return bestPerformance;
  }

  /**
   * Determines whether the week should be included in the final results.
   * Includes all weeks with a performance > 0 or the first two weeks.
   */
  private shouldIncludeWeek(bestPerformance: number, weekIndex: number): boolean {
    return bestPerformance > 0 || weekIndex < 2;
  }
}
