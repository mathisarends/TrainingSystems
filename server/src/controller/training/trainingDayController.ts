import { Request, Response } from 'express';
import { TrainingDay } from '../../models/training/trainingDay.js';

import { Exercise } from '../../models/training/exercise.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import {
  createExerciseObject,
  findLatestTrainingDayWithWeight,
  updateExercise
} from '../../service/trainingService.js';

import { ApiData } from '../../models/apiData.js';
import { WeightRecommendationBase } from '../../models/training/weight-recommandation.enum.js';

import { TrainingDayDto } from '../../service/trainingPlan/dto/training-day-dto.js';
import { TrainingPlanService } from '../../service/trainingPlan/training-plan-service.js';
import { WeightRecommendationService } from '../../service/trainingPlan/weight-recommandation-service.js';
import trainingPlanManager from '../../service/trainingPlanManager.js';
import userManager from '../../service/userManager.js';
import trainingSessionManager from './training-detection/training-session-manager.js';

/**
 * REtrives the data for a certain training day in the training plan.
 */
export async function getTrainingDayData(req: Request, res: Response): Promise<Response<TrainingDayDto>> {
  const { id, week, day } = req.params;
  const trainingWeekIndex = Number(week);
  const trainingDayIndex = Number(day);

  const user = await userManager.getUser(res);
  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, id);

  const trainingPlanService = new TrainingPlanService(trainingPlan);
  const trainingDay = trainingPlanService.findAndValidateTrainingDay(trainingPlan, trainingWeekIndex, trainingDayIndex);

  let weightRecommandations: string[] = [];

  if (trainingPlan.weightRecommandationBase === WeightRecommendationBase.LASTWEEK && trainingWeekIndex > 0) {
    const previousTrainingDay = trainingPlanService.findAndValidateTrainingDay(
      trainingPlan,
      trainingWeekIndex - 1,
      trainingDayIndex
    );

    weightRecommandations = WeightRecommendationService.getWeightRecommendations(
      trainingDay.exercises,
      previousTrainingDay.exercises
    );
  }

  const trainingDayDto = trainingPlanService.toTrainingDayDto(trainingDay, weightRecommandations);
  return res.status(200).json(trainingDayDto);
}

/**
 * Updates the training data for a specific day in a training plan. The update affects not only
 * the specified day but can also propagate to the same day in subsequent weeks, maintaining consistency.
 */
export async function updateTrainingDataForTrainingDay(req: Request, res: Response) {
  const id = req.params.id;
  const trainingWeekIndex = Number(req.params.week);
  const trainingDayIndex = Number(req.params.day);

  const user = await userManager.getUser(res);
  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, id);

  const trainingPlanService = new TrainingPlanService(trainingPlan);
  const trainingDay = trainingPlanService.findAndValidateTrainingDay(trainingPlan, trainingWeekIndex, trainingDayIndex);
  trainingPlan.lastUpdated = new Date();

  const changedData: ApiData = req.body;

  updateTrainingDay(trainingDay, changedData);
  propagateChangesToFutureWeeks(trainingPlan, trainingWeekIndex, trainingDayIndex, changedData);

  await userManager.update(user);

  for (const [fieldName, fieldValue] of Object.entries(changedData)) {
    if (trainingSessionManager.isTrainingActivitySignal(fieldName, fieldValue)) {
      const trainingSessionTracker = await trainingSessionManager.getOrCreateTracker(trainingDay, user.id);
      trainingSessionTracker.handleActivitySignal();
      break;
    }
  }

  res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert', trainingDay });
}

/**
 * Fetches the latest day with recorded weight data from the specified training plan.
 * This is particularly useful for resuming or reviewing recent training progress.
 */
export async function getLatestTrainingDay(req: Request, res: Response) {
  const trainingPlanId = req.params.id;
  const user = await userManager.getUser(res);
  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  const { weekIndex, dayIndex } = findLatestTrainingDayWithWeight(trainingPlan);

  return res.status(200).json({ weekIndex, dayIndex });
}

/**
 * Updates a training day with new data.
 *
 * @param trainingDay - The training day to be updated.
 * @param changedData - The new data to be applied.
 */
export function updateTrainingDay(trainingDay: TrainingDay, changedData: ApiData): void {
  let deleteLogicHappend = false;

  for (const [fieldName, fieldValue] of Object.entries(changedData)) {
    const exerciseNumber = parseInt(fieldName.charAt(13));
    const exercise = trainingDay.exercises[exerciseNumber - 1];

    // If no exercise exists and the field indicates a new category, create a new exercise
    if (!exercise && fieldName.endsWith('category')) {
      const newExercise = createExerciseObject(fieldName, fieldValue) as Exercise;
      trainingDay.exercises.push(newExercise);
    }

    // handle deleted exercise which is not the last one
    if (isDeletedExercise(exercise, fieldName, fieldValue)) {
      let exerciseIndex = trainingDay.exercises.findIndex(ex => ex === exercise);

      // Shift exercises one position up
      while (exerciseIndex < trainingDay.exercises.length - 1) {
        trainingDay.exercises[exerciseIndex] = trainingDay.exercises[exerciseIndex + 1];

        exerciseIndex++;
      }
      trainingDay.exercises.pop();
      deleteLogicHappend = true;
    }

    if (exercise && !deleteLogicHappend) {
      updateExercise(fieldName, fieldValue, exercise, trainingDay, exerciseNumber);
    }
  }
}

function isDeletedExercise(exercise: Exercise, fieldName: string, fieldValue: string) {
  return exercise && fieldName.endsWith('category') && !fieldValue;
}

/**
 * Propagates changes to the exercises to all following weeks in the training plan.
 *
 * @param trainingPlan - The training plan containing the weeks and days.
 * @param startWeekIndex - The week index from which to start propagating changes.
 * @param trainingDayIndex - The day index to be updated.
 * @param changedData - The data to be propagated.
 */
function propagateChangesToFutureWeeks(
  trainingPlan: TrainingPlan,
  startWeekIndex: number,
  trainingDayIndex: number,
  changedData: ApiData
): void {
  let tempWeekIndex = startWeekIndex + 1;

  while (tempWeekIndex < trainingPlan.trainingWeeks.length) {
    const trainingDayInLaterWeek = trainingPlan.trainingWeeks[tempWeekIndex].trainingDays[trainingDayIndex];

    for (const [fieldName, fieldValue] of Object.entries(changedData)) {
      const exerciseIndex = parseInt(fieldName.charAt(13));
      const exerciseInLaterWeek = trainingDayInLaterWeek.exercises[exerciseIndex - 1];

      if (!exerciseInLaterWeek) {
        const newExercise = createExerciseObject(fieldName, fieldValue) as Exercise;
        trainingDayInLaterWeek.exercises.push(newExercise);
      } else {
        updateExercise(fieldName, fieldValue, exerciseInLaterWeek, trainingDayInLaterWeek, exerciseIndex, true);
      }
    }

    tempWeekIndex++;
  }
}
