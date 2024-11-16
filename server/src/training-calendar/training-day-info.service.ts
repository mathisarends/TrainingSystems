import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingPlan } from 'src/training/model/training-plan.model';
import { TrainingService } from 'src/training/training.service';
import { ExerciseCategoryComparisonDto } from './dto/exercise-category-comparison.dto';
import { TrainingRetrospectivePopupCardInfo } from './dto/training-retrospective-popup-card-info.dto';

@Injectable()
export class TrainingDayInfoService {
  constructor(private readonly trainingService: TrainingService) {}

  async getTrainingDayInfo(
    userId: string,
    planId: string,
    weekIndex: number,
    dayIndex: number,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      planId,
    );
    const trainingDay =
      trainingPlan.trainingWeeks[weekIndex].trainingDays[dayIndex];

    if (!trainingDay) {
      throw new NotFoundException(
        `The training day could not be found for weekIndex ${weekIndex} and dayIndex ${dayIndex}`,
      );
    }

    return trainingDay;
  }

  async getTrainingRetrospectivePopupCardInfo(
    userId: string,
    planId: string,
    weekIndex: number,
    dayIndex: number,
  ): Promise<TrainingRetrospectivePopupCardInfo> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      planId,
    );

    const trainingDay =
      trainingPlan.trainingWeeks[weekIndex]?.trainingDays[dayIndex];
    if (!trainingDay) {
      throw new NotFoundException(
        `The training day could not be found for weekIndex ${weekIndex} and dayIndex ${dayIndex}`,
      );
    }

    const previousTrainingDay =
      weekIndex >= 1
        ? trainingPlan.trainingWeeks[weekIndex - 1]?.trainingDays[dayIndex]
        : undefined;

    const tonnageDifferenceFromLastWeek = this.getTonnageDifferenceFromLastWeek(
      trainingDay,
      previousTrainingDay,
    );
    const durationDifferenceFromLastWeek =
      this.getDurationDifferenceFromLastWeek(trainingDay, previousTrainingDay);
    const tonnageComparisonOverWeekSpan =
      this.getTonnnageComparisonOverWeekSpan(trainingPlan, dayIndex);
    const performanceComparisonOverWeekSpan =
      this.getPerformanceComparisonOverWeekSpan(trainingPlan, dayIndex);

    const tonnage = this.getTonnagePerTrainingDay(trainingDay);
    const durationInMinutes = trainingDay.durationInMinutes;

    return {
      tonnageDifferenceFromLastWeek,
      durationDifferenceFromLastWeek,
      tonnageComparisonOverWeekSpan,
      performanceComparisonOverWeekSpan,
      tonnage,
      durationInMinutes,
    };
  }

  private getTonnnageComparisonOverWeekSpan(
    trainingPlan: TrainingPlan,
    dayIndex: number,
  ): ExerciseCategoryComparisonDto {
    const tonnageComparison: ExerciseCategoryComparisonDto = {};

    trainingPlan.trainingWeeks.forEach((week, weekIndex) => {
      const trainingDay = week.trainingDays[dayIndex];

      trainingDay.exercises.forEach((exercise) => {
        const { category, weight, sets, reps } = exercise;
        const numericWeight = Number(weight);
        if (isNaN(numericWeight)) {
          return;
        }

        const tonnage = numericWeight * sets * reps;

        if (!tonnageComparison[category]) {
          tonnageComparison[category] = [];
        }

        // Add the tonnage value directly for the current week index
        tonnageComparison[category].push(tonnage);
      });
    });

    for (const category in tonnageComparison) {
      tonnageComparison[category] = this.trimTrailingZeros(
        tonnageComparison[category],
      );
    }

    return tonnageComparison;
  }

  private getPerformanceComparisonOverWeekSpan(
    trainingPlan: TrainingPlan,
    dayIndex: number,
  ): ExerciseCategoryComparisonDto {
    const performanceComparison: ExerciseCategoryComparisonDto = {};

    trainingPlan.trainingWeeks.forEach((week, weekIndex) => {
      const trainingDay = week.trainingDays[dayIndex];

      trainingDay.exercises.forEach((exercise) => {
        const { category, estMax } = exercise;
        const numericEstMax = estMax ?? 0;

        if (!performanceComparison[category]) {
          performanceComparison[category] = [];
        }

        // Add the highest estMax value for the current week index only if it exists
        if (numericEstMax > 0) {
          performanceComparison[category].push(numericEstMax);
        }
      });
    });

    for (const category in performanceComparison) {
      performanceComparison[category] = this.trimTrailingZeros(
        performanceComparison[category],
      );
    }

    return performanceComparison;
  }

  private getTonnageDifferenceFromLastWeek(
    currentTrainingDay: TrainingDay,
    previousTrainingDay: TrainingDay | undefined,
  ) {
    if (!previousTrainingDay) {
      return this.getTonnagePerTrainingDay(currentTrainingDay);
    }

    const currentTrainingDayTonnage =
      this.getTonnagePerTrainingDay(currentTrainingDay);
    const previousTrainingDayTonnage =
      this.getTonnagePerTrainingDay(previousTrainingDay);

    return currentTrainingDayTonnage - previousTrainingDayTonnage;
  }

  private getDurationDifferenceFromLastWeek(
    currentTrainingDay: TrainingDay,
    previousTrainingDay: TrainingDay | undefined,
  ) {
    if (!previousTrainingDay) {
      return currentTrainingDay.durationInMinutes;
    }

    return (
      currentTrainingDay.durationInMinutes -
      previousTrainingDay.durationInMinutes
    );
  }

  private getTonnagePerTrainingDay(trainingDay: TrainingDay): number {
    let tonnage = 0;

    for (const exercise of trainingDay.exercises) {
      const weight = Number(exercise.weight);

      if (isNaN(weight)) continue;

      const tonnagePerExercise = weight * exercise.sets * exercise.reps;
      tonnage += tonnagePerExercise;
    }

    return tonnage;
  }

  private trimTrailingZeros(array: number[]): number[] {
    let endIndex = array.length;

    while (endIndex > 0 && array[endIndex - 1] === 0) {
      endIndex--;
    }

    return array.slice(0, endIndex);
  }
}