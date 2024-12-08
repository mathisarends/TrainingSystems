import { Injectable } from '@nestjs/common';
import { TrainingService } from 'src/training/training.service';
import { TrainingPlanViewValidationService } from '../../service/training-plan-view-validation.service';
import { TrainingDayExerciseDto } from '../dto/training-day-exercise.dto';
import { Exercise, ExerciseDto } from '../../model/exercise.schema';
import { TrainingDay } from '../../model/training-day.schema';
import { TrainingPlan } from '../../model/training-plan.model';

@Injectable()
export class TrainingExerciseDeleteService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

  /**
   * Deletes an exercise from a specific training day and propagates the deletion to future weeks.
   *
   * @param userId - The ID of the user owning the training plan.
   * @param trainingPlanId - The ID of the training plan.
   * @param weekIndex - The index of the week containing the training day.
   * @param dayIndex - The index of the day in the week.
   * @param updatedExercise - The exercise data (DTO) to delete.
   */
  async deleteExerciseFromTrainingDay(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    updatedExercise: TrainingDayExerciseDto,
  ): Promise<ExerciseDto> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(
      userId,
      trainingPlanId,
    );

    const trainingDay =
      this.trainingPlanViewValidationService.findAndValidateTrainingDay(
        trainingPlan,
        weekIndex,
        dayIndex,
      );

    trainingPlan.lastUpdated = new Date();

    const exerciseToDelete = this.findExerciseInTrainingDayById(
      trainingDay,
      updatedExercise,
    );

    if (!exerciseToDelete) {
      throw new Error(
        `Exercise with ID ${updatedExercise.id} not found in training day.`,
      );
    }

    this.propagateDeletionToFutureWeeks(
      trainingPlan,
      weekIndex,
      dayIndex,
      exerciseToDelete,
    );

    this.deleteExercise(trainingDay, exerciseToDelete);

    trainingPlan.markModified('trainingWeeks');
    await trainingPlan.save();
    return exerciseToDelete;
  }

  /**
   * Deletes an exercise from a training day.
   */
  private deleteExercise(trainingDay: TrainingDay, exercise: Exercise): void {
    const indexToRemove = trainingDay.exercises.findIndex(
      (ex) => ex.id === exercise.id,
    );

    if (indexToRemove !== -1) {
      trainingDay.exercises.splice(indexToRemove, 1);
    }
  }

  /**
   * Propagates the deletion of an exercise to future weeks within the training plan based on its index.
   */
  private propagateDeletionToFutureWeeks(
    trainingPlan: TrainingPlan,
    startWeekIndex: number,
    trainingDayIndex: number,
    exerciseToDelete: Exercise,
  ): void {
    const currentWeek = trainingPlan.trainingWeeks[startWeekIndex];
    const currentDay = currentWeek.trainingDays[trainingDayIndex];

    const exerciseIndex = currentDay.exercises.findIndex(
      (ex) => ex.id === exerciseToDelete.id,
    );

    console.log('exerciseIndex', exerciseIndex);

    if (exerciseIndex === -1) {
      console.warn(
        'Exercise not found in the current training day for deletion.',
      );
      return;
    }

    for (
      let weekIndex = startWeekIndex + 1;
      weekIndex < trainingPlan.trainingWeeks.length;
      weekIndex++
    ) {
      const futureTrainingDay =
        trainingPlan.trainingWeeks[weekIndex].trainingDays[trainingDayIndex];

      if (
        futureTrainingDay &&
        futureTrainingDay.exercises.length > exerciseIndex
      ) {
        futureTrainingDay.exercises.splice(exerciseIndex, 1);
      }
    }
  }

  /**
   * Finds an exercise in the training day by its ID.
   */
  private findExerciseInTrainingDayById(
    trainingDay: TrainingDay,
    updatedExercise: TrainingDayExerciseDto,
  ): Exercise | undefined {
    if (!updatedExercise.id) {
      return undefined;
    }

    return trainingDay.exercises.find(
      (exercise) => exercise.id === updatedExercise.id,
    );
  }
}
