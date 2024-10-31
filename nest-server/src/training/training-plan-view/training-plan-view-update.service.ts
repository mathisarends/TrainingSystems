import { Injectable } from '@nestjs/common';
import { ApiData } from 'src/types/api-data';
import { UserExerciseRecordService } from 'src/user-exercise-record/user-exercise-record.service';
import { Exercise, ExerciseDto } from '../model/exercise.schema';
import { TrainingDay } from '../model/training-day.schema';
import { TrainingPlan } from '../model/training-plan.model';
import { TrainingPlanViewValidationService } from '../service/training-plan-view-validation.service';
import { TrainingService } from '../training.service';
import { TrainingSessionManagerService } from './training-session-manager.service';

@Injectable()
export class TrainingPlanViewUpdateService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly trainingPlanViewValidationService: TrainingPlanViewValidationService,
    private readonly trainingSessionManagerService: TrainingSessionManagerService,
    private readonly userExerciseRecordService: UserExerciseRecordService,
  ) {}

  async updateTrainingDataForTrainingDay(
    userId: string,
    trainingPlanId: string,
    weekIndex: number,
    dayIndex: number,
    updatedData: ApiData,
    fingerprint: string,
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

    this.updateTrainingDay(trainingDay, updatedData);

    this.propagateChangesToFutureWeeks(
      trainingPlan,
      weekIndex,
      dayIndex,
      updatedData,
    );

    await trainingPlan.save();

    for (const [fieldName, fieldValue] of Object.entries(updatedData)) {
      if (
        this.trainingSessionManagerService.isTrainingActivitySignal(
          fieldName,
          fieldValue,
        )
      ) {
        const trainingSessionTracker =
          await this.trainingSessionManagerService.getOrCreateTracker(
            trainingDay,
            userId,
            fingerprint,
          );
        trainingSessionTracker.handleActivitySignal();
        break;
      }
    }

    await this.checkAndHandleNewPR(updatedData, trainingDay, userId);
  }

  private updateTrainingDay(
    trainingDay: TrainingDay,
    changedData: ApiData,
  ): void {
    let deleteLogicHappend = false;

    for (const [fieldName, fieldValue] of Object.entries(changedData)) {
      const exerciseNumber = parseInt(fieldName.charAt(13));
      const exercise = trainingDay.exercises[exerciseNumber - 1];

      // If no exercise exists and the field indicates a new category, create a new exercise
      if (!exercise && fieldName.endsWith('category')) {
        const newExercise = this.createExerciseObject(
          fieldName,
          fieldValue,
        ) as Exercise;
        trainingDay.exercises.push(newExercise);
      }

      if (this.isDeletedExercise(exercise, fieldName, fieldValue)) {
        // handle deleted exercise which is not the last one
        let exerciseIndex = trainingDay.exercises.findIndex(
          (ex) => ex === exercise,
        );

        // Shift exercises one position up
        while (exerciseIndex < trainingDay.exercises.length - 1) {
          trainingDay.exercises[exerciseIndex] =
            trainingDay.exercises[exerciseIndex + 1];

          exerciseIndex++;
        }
        trainingDay.exercises.pop();
        deleteLogicHappend = true;
      }

      if (exercise && !deleteLogicHappend) {
        this.updateExercise(
          fieldName,
          fieldValue,
          exercise,
          trainingDay,
          exerciseNumber,
        );
      }
    }
  }

  async checkAndHandleNewPR(
    requestBody: ApiData,
    trainingDay: TrainingDay,
    userId: string,
  ): Promise<void> {
    const exercise = this.extractExerciseFromRequest(requestBody, trainingDay);
    console.log('🚀 ~ TrainingPlanViewUpdateService ~ exercise:', exercise);
    if (!exercise) {
      return;
    }

    await this.evaluateAndSaveNewPR(userId, exercise);
  }

  private extractExerciseFromRequest(
    requestBody: ApiData,
    trainingDay: TrainingDay,
  ): Exercise | null {
    for (const fieldName of Object.keys(requestBody)) {
      console.log('🚀 ~ TrainingPlanViewUpdateService ~ fieldName:', fieldName);
      if (this.isEstMax(fieldName)) {
        const exerciseNumber = Number(fieldName.charAt(13));
        return trainingDay.exercises[exerciseNumber - 1];
      }
    }
    return null;
  }

  private async evaluateAndSaveNewPR(
    userId: string,
    exercise: Exercise,
  ): Promise<void> {
    const previousRecord =
      await this.userExerciseRecordService.getRecordByUserAndExercise(
        userId,
        exercise.exercise,
      );

    if (previousRecord.estMax >= exercise.estMax) {
      return;
    }

    await this.userExerciseRecordService.saveUserRecordByExercise(
      exercise,
      userId,
    );

    if (previousRecord.previousRecords.length > 1) {
      console.log('show nots hier');
    }
  }

  // DELETE this incomprehensive logic. API in frontend does not exist anymore.
  private isDeletedExercise(
    exercise: Exercise,
    fieldName: string,
    fieldValue: string,
  ) {
    return exercise && fieldName.endsWith('category') && !fieldValue;
  }

  private createExerciseObject(
    fieldName: string,
    fieldValue: string,
  ): ExerciseDto | null {
    return {
      category: fieldName.endsWith('category') ? fieldValue : '',
      exercise: '',
      sets: 0,
      reps: 0,
      weight: '',
      targetRPE: '',
      actualRPE: '',
      estMax: 0,
    };
  }

  private updateExercise(
    fieldName: string,
    fieldValue: string,
    exercise: Exercise,
    trainingDay: TrainingDay,
    exerciseIndex: number,
    copyMode = false,
  ) {
    if (
      fieldName.endsWith('category') &&
      (fieldValue === '- Bitte Auswählen -' || fieldValue === '')
    ) {
      trainingDay.exercises.splice(exerciseIndex - 1, 1);
      return;
    }

    if (
      copyMode &&
      (fieldName.endsWith('actualRPE') ||
        fieldName.endsWith('weight') ||
        fieldName.endsWith('estMax'))
    ) {
      return;
    }

    switch (true) {
      case fieldName.endsWith('category'):
        exercise.category = fieldValue;
        break;
      case fieldName.endsWith('exercise_name'):
        exercise.exercise = fieldValue;
        break;
      case fieldName.endsWith('sets'):
        exercise.sets = Number(fieldValue);
        break;
      case fieldName.endsWith('reps'):
        exercise.reps = Number(fieldValue);
        break;
      case fieldName.endsWith('weight'):
        exercise.weight = fieldValue;
        break;
      case fieldName.endsWith('targetRPE'):
        exercise.targetRPE = fieldValue;
        break;
      case fieldName.endsWith('actualRPE'):
        exercise.actualRPE = fieldValue;
        break;
      case fieldName.endsWith('estMax'):
        exercise.estMax = Number(fieldValue);
        break;
      case fieldName.endsWith('notes'):
        exercise.notes = fieldValue;
        break;
      default:
        console.log('Dieses Feld gibt es leider nicht!');
        break;
    }
  }

  private propagateChangesToFutureWeeks(
    trainingPlan: TrainingPlan,
    startWeekIndex: number,
    trainingDayIndex: number,
    changedData: ApiData,
  ): void {
    let tempWeekIndex = startWeekIndex + 1;

    while (tempWeekIndex < trainingPlan.trainingWeeks.length) {
      const trainingDayInLaterWeek =
        trainingPlan.trainingWeeks[tempWeekIndex].trainingDays[
          trainingDayIndex
        ];

      for (const [fieldName, fieldValue] of Object.entries(changedData)) {
        const exerciseIndex = parseInt(fieldName.charAt(13));
        const exerciseInLaterWeek =
          trainingDayInLaterWeek.exercises[exerciseIndex - 1];

        if (!exerciseInLaterWeek) {
          const newExercise = this.createExerciseObject(
            fieldName,
            fieldValue,
          ) as Exercise;
          trainingDayInLaterWeek.exercises.push(newExercise);
        } else {
          this.updateExercise(
            fieldName,
            fieldValue,
            exerciseInLaterWeek,
            trainingDayInLaterWeek,
            exerciseIndex,
            true,
          );
        }
      }

      tempWeekIndex++;
    }
  }

  private isEstMax(fieldName: string): boolean {
    return fieldName.endsWith('estMax');
  }
}
