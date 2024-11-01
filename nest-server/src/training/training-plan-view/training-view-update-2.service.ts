import { Injectable } from '@nestjs/common';
import { Exercise } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';

@Injectable()
export class TrainingPlanViewUpdateService2 {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
  ) {}

  async updateTrainingDataForTrainingDay(
    userId: string,
    fingerprint: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    updatedExercise: Exercise,
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

    if (!exercise) {
      await trainingDay.save();
      return;
    }

    const changedFields = this.getChangedFields(exercise, updatedExercise);
    console.log(
      '🚀 ~ TrainingPlanViewUpdateService2 ~ changedFields:',
      changedFields,
    );

    Object.assign(exercise, updatedExercise);
  }

  private findExerciseInTrainingDayById(
    trainingDay: TrainingDay,
    updatedExercise: Exercise,
  ): Exercise | undefined {
    for (const exercise of trainingDay.exercises) {
      if (exercise._id.toString() === updatedExercise._id.toString()) {
        return exercise;
      }
    }
    return undefined;
  }

  private getChangedFields(
    originalExercise: Exercise,
    updatedExerciseDto: Exercise,
  ): string[] {
    const changedFields: string[] = [];

    for (const key of Object.keys(updatedExerciseDto)) {
      if (originalExercise[key] !== updatedExerciseDto[key]) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }
}
