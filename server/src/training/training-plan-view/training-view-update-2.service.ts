import { Injectable } from '@nestjs/common';
import { Exercise } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';
import { TrainingDayExerciseDto } from './dto/training-day-exercise.dto';

/**
 * Service responsible for updating training data for a specific training day within a training plan.
 * Handles the creation, update, and validation of exercises and training days.
 */
@Injectable()
export class TrainingPlanViewUpdateService2 {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

  async updateTrainingDataForTrainingDay(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    updatedExercise: TrainingDayExerciseDto,
  ) {
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

    const exercise = this.findExerciseInTrainingDayById(
      trainingDay,
      updatedExercise,
    );

    let newExercise = undefined;

    if (!exercise) {
      newExercise = this.createExercise(updatedExercise);
      trainingDay.exercises.push(newExercise as unknown as Exercise);
    } else {
      this.updateExerciseProperties(exercise, updatedExercise);
    }

    trainingPlan.markModified('trainingWeeks');
    await trainingPlan.save();

    return exercise ?? newExercise;
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

  /**
   * Creates a new exercise object from the provided DTO.
   */
  private createExercise(updatedExercise: TrainingDayExerciseDto) {
    return {
      id: this.generateId(),
      category: updatedExercise.category,
      exercise: updatedExercise.exercise,
      sets: updatedExercise.sets,
      reps: updatedExercise.reps,
      weight: updatedExercise.weight,
      targetRPE: updatedExercise.targetRPE,
      actualRPE: updatedExercise.actualRPE,
      estMax: updatedExercise.estMax,
      notes: updatedExercise.notes,
    };
  }

  /**
   * Updates the properties of an existing exercise with data from the DTO.
   */
  private updateExerciseProperties(
    exercise: Exercise,
    updatedExercise: TrainingDayExerciseDto,
  ): void {
    exercise.category = updatedExercise.category;
    exercise.exercise = updatedExercise.exercise;
    exercise.sets = updatedExercise.sets;
    exercise.reps = updatedExercise.reps;
    exercise.weight = updatedExercise.weight;
    exercise.targetRPE = updatedExercise.targetRPE;
    exercise.actualRPE = updatedExercise.actualRPE;
    exercise.estMax = updatedExercise.estMax;
    exercise.notes = updatedExercise.notes;
  }

  /**
   * Generates a unique ID for a new exercise.
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
