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
   * Berechnet die beste Leistung pro Übungskategorie über die Wochen.
   */
  private getBestPerformanceByExercise(exerciseCategory: ExerciseCategoryType): number[] {
    return this.trainingPlan.trainingWeeks
      .map(week => {
        const bestPerformance = this.getBestPerformanceForWeek(week, exerciseCategory);
        return { bestPerformance, isInitialWeek: this.isInitialWeek(week) };
      })
      .filter(weekData => this.shouldIncludeWeek(weekData.bestPerformance, weekData.isInitialWeek))
      .map(weekData => weekData.bestPerformance);
  }

  /**
   * Berechnet die beste Leistung in einer Woche für eine Übungskategorie.
   */
  private getBestPerformanceForWeek(week: TrainingWeek, exerciseCategory: ExerciseCategoryType): number {
    let bestPerformance = 0;

    week.trainingDays.forEach(trainingDay => {
      bestPerformance = Math.max(bestPerformance, this.getBestPerformanceForDay(trainingDay, exerciseCategory));
    });

    return bestPerformance;
  }

  /**
   * Berechnet die beste Leistung an einem Trainingstag für eine Übungskategorie.
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
   * Bestimmt, ob die Woche in den Endergebnissen enthalten sein soll.
   * Berücksichtigt alle Wochen mit einer Leistung > 0 oder die ersten beiden Wochen.
   */
  private shouldIncludeWeek(bestPerformance: number, isInitialWeek: boolean): boolean {
    return bestPerformance > 0 || isInitialWeek;
  }

  /**
   * Bestimmt, ob es sich um eine der ersten beiden Wochen handelt.
   */
  private isInitialWeek(week: TrainingWeek): boolean {
    const index = this.trainingPlan.trainingWeeks.indexOf(week);
    return index === 0 || index === 1;
  }
}
