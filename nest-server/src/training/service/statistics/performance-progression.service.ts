import { Injectable } from '@nestjs/common';
import { capitalize } from 'lodash';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { ChartDataDto } from 'src/training/model/chart-data.dto';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingPlan } from 'src/training/model/training-plan.schema';
import { TrainingWeek } from 'src/training/model/training-week.schema';

@Injectable()
export class PerformanceProgressionService {
  private mainExercises = [
    ExerciseCategoryType.SQUAT,
    ExerciseCategoryType.BENCH,
    ExerciseCategoryType.DEADLIFT,
    ExerciseCategoryType.OVERHEADPRESS,
  ];

  getPerformanceProgressionByCategories(
    trainingPlan: TrainingPlan,
    exerciseCategories: ExerciseCategoryType[],
  ): ChartDataDto {
    const validExercises = exerciseCategories.filter((exercise) =>
      this.mainExercises.includes(exercise),
    );

    const responseData = validExercises.reduce((result, category) => {
      result[capitalize(category)] = this.getBestPerformanceByExercise(
        trainingPlan,
        category,
      );
      return result;
    }, {} as ChartDataDto);

    return responseData;
  }

  /**
   * Berechnet die beste Leistung pro Übungskategorie über die Wochen.
   */
  private getBestPerformanceByExercise(
    trainingPlan: TrainingPlan,
    exerciseCategory: ExerciseCategoryType,
  ): number[] {
    return trainingPlan.trainingWeeks
      .map((week, index) => {
        const bestPerformance = this.getBestPerformanceForWeek(
          week,
          exerciseCategory,
        );
        return { bestPerformance, index };
      })
      .filter((weekData) =>
        this.shouldIncludeWeek(weekData.bestPerformance, weekData.index),
      )
      .map((weekData) => weekData.bestPerformance);
  }

  /**
   * Berechnet die beste Leistung in einer Woche für eine bestimmte Übungskategorie.
   */
  private getBestPerformanceForWeek(
    week: TrainingWeek,
    exerciseCategory: ExerciseCategoryType,
  ): number {
    let bestPerformance = 0;

    week.trainingDays.forEach((trainingDay) => {
      bestPerformance = Math.max(
        bestPerformance,
        this.getBestPerformanceForDay(trainingDay, exerciseCategory),
      );
    });

    return bestPerformance;
  }

  /**
   * Berechnet die beste Leistung an einem Trainingstag für eine spezifische Übungskategorie.
   */
  private getBestPerformanceForDay(
    trainingDay: TrainingDay,
    exerciseCategory: ExerciseCategoryType,
  ): number {
    let bestPerformance = 0;

    trainingDay.exercises.forEach((exercise) => {
      if (exercise.category === exerciseCategory && exercise.estMax) {
        bestPerformance = Math.max(bestPerformance, exercise.estMax);
      }
    });

    return bestPerformance;
  }

  /**
   * Bestimmt, ob eine Woche in die Endergebnisse eingeschlossen werden soll.
   * Beinhaltet alle Wochen mit einer Leistung > 0 oder die ersten beiden Wochen.
   */
  private shouldIncludeWeek(
    bestPerformance: number,
    weekIndex: number,
  ): boolean {
    return bestPerformance > 0 || weekIndex < 2;
  }
}
