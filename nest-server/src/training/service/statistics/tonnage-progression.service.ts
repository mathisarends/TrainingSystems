import { Injectable } from '@nestjs/common';

import { capitalize } from 'lodash';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { ChartDataDto } from 'src/training/model/chart-data.dto';
import { Exercise } from 'src/training/model/exercise.schema';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingPlan } from 'src/training/model/training-plan.schema';
import { TrainingWeek } from 'src/training/model/training-week.schema';

@Injectable()
export class TonnageProgressionService {
  getTonnageProgressionByCategories(
    trainingPlan: TrainingPlan,
    exerciseCategories: ExerciseCategoryType[],
  ): ChartDataDto {
    const responseData: ChartDataDto = {};

    exerciseCategories.forEach((category) => {
      responseData[capitalize(category)] =
        this.prepareTonnageForExerciseCategory(trainingPlan, category);
    });

    return responseData;
  }

  private prepareTonnageForExerciseCategory(
    trainingPlan: TrainingPlan,
    exerciseCategory: ExerciseCategoryType,
  ): number[] {
    return trainingPlan.trainingWeeks
      .map((week) => this.calculateTonnageForWeek(week, exerciseCategory))
      .filter((tonnage, index) => this.shouldIncludeWeek(tonnage, index));
  }

  private calculateTonnageForWeek(
    week: TrainingWeek,
    exerciseCategory: ExerciseCategoryType,
  ): number {
    let totalTonnageForWeek = 0;

    week.trainingDays.forEach((trainingDay) => {
      totalTonnageForWeek += this.calculateTonnageForDayAndCategory(
        trainingDay,
        exerciseCategory,
      );
    });

    return totalTonnageForWeek;
  }

  private calculateTonnageForDayAndCategory(
    trainingDay: TrainingDay,
    exerciseCategory: ExerciseCategoryType,
  ): number {
    let totalTonnageForDay = 0;

    trainingDay.exercises.forEach((exercise) => {
      if (this.isMatchingCategory(exercise, exerciseCategory)) {
        totalTonnageForDay += this.calculateTonnageForExercise(exercise);
      }
    });

    return totalTonnageForDay;
  }

  private isMatchingCategory(
    exercise: Exercise,
    exerciseCategory: ExerciseCategoryType,
  ): boolean {
    return exercise.category === exerciseCategory;
  }

  private calculateTonnageForExercise(exercise: Exercise): number {
    const weight = parseFloat(exercise.weight) || 0;
    return exercise.sets * exercise.reps * weight;
  }

  private shouldIncludeWeek(tonnage: number, index: number): boolean {
    const isInitialWeek = index === 0 || index === 1;
    const hasTonnage = tonnage > 0;

    return isInitialWeek || hasTonnage;
  }
}
