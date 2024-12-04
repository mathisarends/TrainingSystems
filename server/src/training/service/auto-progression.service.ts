import { Injectable } from '@nestjs/common';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { AutoProgressionDto } from '../dto/auto-progression.dto';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingService } from '../training.service';

/**
 * Service responsible for implementing an auto-progression rate across a training block.
 */
@Injectable()
export class AutoProgressionService {
  constructor(private trainingService: TrainingService) {}

  /**
   * Applies auto-progression adjustments to a user's training plan.
   */
  async handleAutoProgressionForTrainingPlan(
    userId: string,
    trainingPlanId: string,
    autoProgressionDto: AutoProgressionDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    trainingPlan.trainingWeeks.forEach((_, weekIndex) => {
      if (
        autoProgressionDto.withDeloadWeek &&
        this.isLastWeek(trainingPlan, weekIndex)
      ) {
        this.handleDeloadWeek(trainingPlan, weekIndex);
      } else if (weekIndex !== 0) {
        this.adjustRPEForWeek(
          trainingPlan,
          weekIndex,
          autoProgressionDto.rpeProgression,
        );
      }
    });

    await trainingPlan.save();
  }

  /**
   * Checks if the specified week is the last week in the training plan. Relevant for plaining deload information if given.
   */
  private isLastWeek(trainingPlan: TrainingPlan, weekIndex: number): boolean {
    return trainingPlan.trainingWeeks.length - 1 === weekIndex;
  }

  /**
   * Adjusts the sets and target RPE for a deload week.
   */
  private handleDeloadWeek(
    trainingPlan: TrainingPlan,
    weekIndex: number,
  ): void {
    const lastTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];
    const deloadTrainingWeek = trainingPlan.trainingWeeks[weekIndex];

    deloadTrainingWeek.trainingDays.forEach((trainingDay, dayIndex) => {
      const trainingDayBeforeDeload = lastTrainingWeek.trainingDays[dayIndex];

      trainingDay.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseBeforeDeload =
          trainingDayBeforeDeload.exercises[exerciseIndex];

        if (exercise.exercise !== exerciseBeforeDeload.exercise) {
          return;
        }

        exercise.sets = Math.max(exerciseBeforeDeload.sets - 1, 0);
        exercise.targetRPE = this.isMainCategory(exercise.category) ? 6 : 7;
      });
    });
  }

  /**
   * Determines if the exercise category is a main category (Squat, Bench, Deadlift).
   */
  private isMainCategory(category: string): boolean {
    return (
      category === ExerciseCategoryType.SQUAT ||
      category === ExerciseCategoryType.BENCH ||
      category === ExerciseCategoryType.DEADLIFT
    );
  }

  /**
   * Adjusts the target RPE for a specified week based on a provided RPE progression value.
   */
  private adjustRPEForWeek(
    trainingPlan: TrainingPlan,
    weekIndex: number,
    rpeIncrease: number,
  ): void {
    const previousTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];
    const currentTrainingWeek = trainingPlan.trainingWeeks[weekIndex];

    currentTrainingWeek.trainingDays.forEach((trainingDay, dayIndex) => {
      const previousWeekTrainingDay =
        previousTrainingWeek.trainingDays[dayIndex];

      trainingDay.exercises.forEach((exercise, exerciseIndex) => {
        const previousWeekExercise =
          previousWeekTrainingDay?.exercises[exerciseIndex];

        if (exercise.exercise !== previousWeekExercise?.exercise) {
          return;
        }

        const rpeMax = this.isMainCategory(exercise.category) ? 9 : 10;

        const parsedRPE = Number(previousWeekExercise.targetRPE);
        exercise.targetRPE = Math.min(parsedRPE + rpeIncrease, rpeMax);
      });
    });
  }
}
