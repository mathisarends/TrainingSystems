import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';
import { TrainingDayExercisesRearrangementDto } from '../dto/training-day-exercises-rearrangement.dto';
import { Exercise } from '../model/exercise.schema';
import { TrainingPlan } from '../model/training-plan.model';

/**
 * Service responsible for updating training data for a specific training day within a training plan.
 * Handles the creation, update, and validation of exercises and training days.
 */
@Injectable()
export class TrainingViewExerciseRearrangementService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

  async rearrangeExerciseOrder(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    trainingDayExercisesRearrangementDto: TrainingDayExercisesRearrangementDto,
  ) {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);

    const trainingDay = this.trainingPlanViewValidationService.findAndValidateTrainingDay(
      trainingPlan,
      weekIndex,
      dayIndex,
    );

    trainingDay.exercises = trainingDayExercisesRearrangementDto.exercises as Exercise[];
    this.propagateChangesToFutureWeeks(trainingPlan, weekIndex, dayIndex, trainingDayExercisesRearrangementDto);

    trainingPlan.lastUpdated = new Date();

    trainingPlan.markModified('trainingWeeks');
    await trainingPlan.save();
  }

  /**
   * Propagates changes in a training day to future weeks within the training plan.
   */
  private propagateChangesToFutureWeeks(
    trainingPlan: TrainingPlan,
    startWeekIndex: number,
    trainingDayIndex: number,
    trainingDayExercisesRearrangementDto: TrainingDayExercisesRearrangementDto,
  ): void {
    for (let weekIndex = startWeekIndex + 1; weekIndex < trainingPlan.trainingWeeks.length; weekIndex++) {
      const trainingDay = trainingPlan.trainingWeeks[weekIndex].trainingDays[trainingDayIndex];

      if (!trainingDay) {
        throw new NotFoundException('Training day was not found');
      }

      trainingDay.exercises = trainingDay.exercises.map((existingExercise, index) => {
        const rearrangedExercise = trainingDayExercisesRearrangementDto.exercises[index];
        if (!rearrangedExercise) {
          return existingExercise;
        }

        return {
          ...existingExercise,
          id: rearrangedExercise.id,
          category: rearrangedExercise.category,
          exercise: rearrangedExercise.exercise,
          sets: rearrangedExercise.sets,
          reps: rearrangedExercise.reps,
          targetRPE: rearrangedExercise.targetRPE,
          // Retain these fields from the existing exercise
          weight: existingExercise.weight,
          actualRPE: existingExercise.actualRPE,
          estMax: existingExercise.estMax,
          notes: existingExercise.notes,
        };
      }) as Exercise[];
    }
  }
}
