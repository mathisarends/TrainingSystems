import { Injectable } from '@nestjs/common';
import { Exercise, ExerciseDto } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';
import { TrainingDayExerciseDto } from './dto/training-day-exercise.dto';
import { TrainingSessionManagerService } from './training-session-manager.service';
import { TrainingPlan } from '../model/training-plan.model';

/**
 * Service responsible for updating training data for a specific training day within a training plan.
 * Handles the creation, update, and validation of exercises and training days.
 */
@Injectable()
export class TrainingPlanViewUpdateService2 {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
    private readonly trainingSessionManagerService: TrainingSessionManagerService,
  ) {}

  async updateTrainingDataForTrainingDay(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    updatedExercise: TrainingDayExerciseDto,
  ): Promise<ExerciseDto> {
    const trainingPlan = await this.trainingService.getPlanByUserAndTrainingId(userId, trainingPlanId);

    const trainingDay = this.trainingPlanViewValidationService.findAndValidateTrainingDay(
      trainingPlan,
      weekIndex,
      dayIndex,
    );

    trainingPlan.lastUpdated = new Date();

    const exercise = this.findExerciseInTrainingDayById(trainingDay, updatedExercise);

    if (exercise && this.hasWeightOrActualRpeChanged(exercise, updatedExercise)) {
      const trainingSessionTracker = await this.trainingSessionManagerService.getOrCreateTracker(trainingDay, userId);

      trainingSessionTracker.handleActivitySignal();
    }

    let newExercise = undefined;

    if (!exercise) {
      newExercise = this.createExercise(updatedExercise);
      trainingDay.exercises.push(newExercise as unknown as Exercise);
    } else {
      this.updateExerciseProperties(exercise, updatedExercise);
    }

    this.propagateChangesToFutureWeeks(trainingPlan, weekIndex, dayIndex, updatedExercise);

    trainingPlan.mostRecentTrainingDayLocator = {
      dayIndex: dayIndex,
      weekIndex: weekIndex,
    };

    trainingPlan.markModified('trainingWeeks');
    await trainingPlan.save();

    return exercise ?? newExercise;
  }

  /**
   * Propagates changes in a training day to future weeks within the training plan.
   */
  private propagateChangesToFutureWeeks(
    trainingPlan: TrainingPlan,
    startWeekIndex: number,
    trainingDayIndex: number,
    updatedExercise: TrainingDayExerciseDto,
  ): void {
    const fieldsToPropagate = this.getFieldsToPropagate();

    for (let weekIndex = startWeekIndex + 1; weekIndex < trainingPlan.trainingWeeks.length; weekIndex++) {
      const futureTrainingDay = this.getTrainingDay(trainingPlan, weekIndex, trainingDayIndex);

      const exerciseIndex = this.getExerciseIndex(trainingPlan, startWeekIndex, trainingDayIndex, updatedExercise);

      if (exerciseIndex !== -1 && exerciseIndex < futureTrainingDay.exercises.length) {
        // Update existing exercise
        const futureExercise = futureTrainingDay.exercises[exerciseIndex];
        this.updateExerciseFields(futureExercise, updatedExercise, fieldsToPropagate);
      } else {
        const newExercise = this.createExerciseFromFields(updatedExercise, fieldsToPropagate);
        futureTrainingDay.exercises.push(newExercise);
      }
    }
  }

  /**
   * Retrieves a training day for a given week and day index.
   */
  private getTrainingDay(trainingPlan: TrainingPlan, weekIndex: number, dayIndex: number): TrainingDay {
    return trainingPlan.trainingWeeks[weekIndex].trainingDays[dayIndex];
  }

  /**
   * Finds the index of the exercise in the training day using the ID from the updated exercise.
   */
  private getExerciseIndex(
    trainingPlan: TrainingPlan,
    startWeekIndex: number,
    dayIndex: number,
    updatedExercise: TrainingDayExerciseDto,
  ): number {
    if (!updatedExercise.id) {
      return -1;
    }

    const trainingDay = this.getTrainingDay(trainingPlan, startWeekIndex, dayIndex);
    return trainingDay.exercises.findIndex((ex) => ex.id === updatedExercise.id);
  }

  /**
   * Updates only the specified fields in an existing exercise.
   */
  private updateExerciseFields(
    exercise: Exercise,
    updatedExercise: TrainingDayExerciseDto,
    fieldsToUpdate: string[],
  ): void {
    fieldsToUpdate.forEach((field) => {
      if (field in updatedExercise) {
        exercise[field] = updatedExercise[field];
      }
    });
  }

  /**
   * Creates a new exercise object based on the specified fields.
   */
  private createExerciseFromFields(updatedExercise: TrainingDayExerciseDto, fieldsToInclude: string[]): Exercise {
    const newExercise: Partial<Exercise> = {};

    fieldsToInclude.forEach((field) => {
      if (field in updatedExercise) {
        newExercise[field] = updatedExercise[field];
      }
    });

    newExercise.id = this.generateId();

    return {
      ...newExercise,
      sets: newExercise.sets || 0,
      reps: newExercise.reps || 0,
      exercise: newExercise.exercise || '',
      category: newExercise.category || '',
      targetRPE: newExercise.targetRPE || 0,
      notes: newExercise.notes || '',
    } as Exercise;
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

    return trainingDay.exercises.find((exercise) => exercise.id === updatedExercise.id);
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
  private updateExerciseProperties(exercise: Exercise, updatedExercise: TrainingDayExerciseDto): void {
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

  private hasWeightOrActualRpeChanged(exercise: Exercise, updatedExercise: TrainingDayExerciseDto): boolean {
    return exercise.weight !== updatedExercise.weight || exercise.actualRPE !== updatedExercise.actualRPE;
  }

  /**
   * Returns the list of fields to propagate to future weeks.
   */
  private getFieldsToPropagate(): string[] {
    return ['category', 'sets', 'reps', 'exercise', 'targetRPE', 'notes'];
  }

  /**
   * Generates a unique ID for a new exercise.
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
