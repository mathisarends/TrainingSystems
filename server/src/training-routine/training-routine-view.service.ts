import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cloneDeep } from 'lodash';
import { Model } from 'mongoose';
import { Exercise } from 'src/training/model/exercise.schema';
import { TrainingDay } from 'src/training/model/training-day.schema';
import { TrainingSessionManagerService } from 'src/training/training-plan-view/training-session-manager.service';
import { ApiData } from 'src/types/api-data';
import { TrainingRoutine } from './model/training-routine.model';

@Injectable()
export class TrainingRoutineViewService {
  constructor(
    @InjectModel(TrainingRoutine.name)
    private readonly trainingRoutineModel: Model<TrainingRoutine>,
    private readonly trainingSessionManager: TrainingSessionManagerService,
  ) {}

  async startTrainingRoutine(userId: string, trainingRoutineId: string) {
    const trainingRoutine = await this.findTrainingRoutineOrFail(userId, trainingRoutineId);

    const trainingRoutineTemplate: TrainingDay = this.prepareTrainingSessionTemplate(trainingRoutine);
    trainingRoutine.versions.push(trainingRoutineTemplate);

    await trainingRoutine.save();

    return {
      trainingRoutineTemplate,
      version: trainingRoutine.versions.push.length,
    };
  }

  async getTrainingSessionByVersion(
    userId: string,
    trainingRoutineId: string,
    versionNumber: number,
  ): Promise<TrainingDay> {
    const trainingRoutine = await this.findTrainingRoutineOrFail(userId, trainingRoutineId);
    this.findVersionByNumberOrFail(trainingRoutine, versionNumber);

    return trainingRoutine.versions[versionNumber - 1];
  }

  async updateTrainingSessionVersion(
    userId: string,
    trainingRoutineId: string,
    versionNumber: number,
    requestBody: ApiData,
  ) {
    const trainingRoutine = await this.findTrainingRoutineOrFail(userId, trainingRoutineId);

    const trainingRoutineVersion = this.findVersionByNumberOrFail(trainingRoutine, versionNumber);

    this.updateExercisesInSessionVersion(trainingRoutineVersion, requestBody);

    for (const [fieldName, fieldValue] of Object.entries(requestBody)) {
      if (this.trainingSessionManager.isTrainingActivitySignal(fieldName, fieldValue)) {
        const trainingSessionTracker = await this.trainingSessionManager.getOrCreateTracker(
          trainingRoutineVersion,
          userId,
        );
        trainingSessionTracker.handleActivitySignal();
        break;
      }
    }

    await trainingRoutine.save();
  }

  async findTrainingRoutineOrFail(userId: string, trainingRoutineId: string) {
    const trainingRoutine = await this.trainingRoutineModel.findOne({
      userId: userId,
      _id: trainingRoutineId,
    });

    if (!trainingRoutine) {
      throw new NotFoundException(
        `Training Routine for userId ${userId} and training routine ${trainingRoutineId} was not found`,
      );
    }

    return trainingRoutine;
  }

  private findVersionByNumberOrFail(trainingRoutine: TrainingRoutine, versionNumber: number): TrainingDay {
    if (!trainingRoutine.versions[versionNumber - 1]) {
      throw new NotFoundException(
        `Training Routine ${trainingRoutine.id} with version number ${versionNumber} was not found`,
      );
    }

    return trainingRoutine.versions[versionNumber - 1];
  }

  /**
   * Prepares a new training session template based on the most recent session.
   *
   * - Copies the most recent training day and resets fields like `estMax`, `notes`, `weight`, and `actualRPE` for each exercise.
   */
  private prepareTrainingSessionTemplate(trainingRoutine: TrainingRoutine): TrainingDay {
    const mostRecentSession = trainingRoutine.versions[0];
    const deepCopyOfMostRecentSession = cloneDeep(mostRecentSession);

    for (const exericse of deepCopyOfMostRecentSession.exercises) {
      exericse.estMax = undefined;
      exericse.notes = undefined;
      exericse.weight = '';
      exericse.actualRPE = '';
    }

    return deepCopyOfMostRecentSession;
  }

  private updateExercisesInSessionVersion(session: TrainingDay, changedData: ApiData) {
    let deleteLogicHappend = false;

    for (const [fieldName, fieldValue] of Object.entries(changedData)) {
      const exerciseIndex = parseInt(fieldName.charAt(17)) - 1;

      const exercise = session.exercises[exerciseIndex];

      if (!exercise && fieldName.endsWith('category')) {
        const newExercise = this.createExerciseObject(fieldName, fieldValue) as Exercise;
        session.exercises.push(newExercise);
      }

      if (this.isDeletedExercise(exercise, fieldName, fieldValue)) {
        let exerciseIndex = session.exercises.findIndex((ex) => ex === exercise);

        // Shift exercises one position up
        while (exerciseIndex < session.exercises.length - 1) {
          session.exercises[exerciseIndex] = session.exercises[exerciseIndex + 1];

          exerciseIndex++;
        }
        session.exercises.pop();
        deleteLogicHappend = true;
      }

      if (exercise && !deleteLogicHappend) {
        this.updateExercise(fieldName, fieldValue, exercise, session, exerciseIndex + 1);
      }
    }
  }

  private isDeletedExercise(exercise: Exercise, fieldName: string, fieldValue: string) {
    return exercise && fieldName.endsWith('category') && !fieldValue;
  }

  private createExerciseObject(fieldName: string, fieldValue: string) {
    return {
      category: fieldName.endsWith('category') ? fieldValue : '',
      exercise: '',
      sets: 0,
      reps: 0,
      weight: '',
      targetRPE: 0,
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
    if (fieldName.endsWith('category') && (fieldValue === '- Bitte Auswählen -' || fieldValue === '')) {
      trainingDay.exercises.splice(exerciseIndex - 1, 1);
      return;
    }

    if (copyMode && (fieldName.endsWith('actualRPE') || fieldName.endsWith('weight') || fieldName.endsWith('estMax'))) {
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
        exercise.targetRPE = Number(fieldValue);
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
}
