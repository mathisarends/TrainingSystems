import { Request, Response } from 'express';
import { TrainingDay } from '../../models/training/trainingDay.js';
import * as trainingService from '../../service/trainingService.js';
import { getUser, getUserGenericDAO } from '../../service/userService.js';

import { Exercise } from '../../models/training/exercise.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import {
  createExerciseObject,
  findLatestTrainingDayWithWeight,
  updateExercise
} from '../../service/trainingService.js';

import { ApiData } from '../../models/apiData.js';
import { WeightRecommendationBase } from '../../models/training/weight-recommandation.enum.js';
import { TrainingDayDataLocator } from './training-day-data-locator.js';

import { ValidationError } from '../../errors/validationError.js';
import trainingPlanManager from '../../service/trainingPlanManager.js';
import userManager from '../../service/userManager.js';
import trainingSessionManager from './training-session-manager.js';

/**
 * Updates an existing training plan based on user input. Adjustments can include changes
 * to the plan's title, frequency, and week structure. It also handles differences in the
 * number of weeks by either adding or removing weeks from the plan.
 */
export async function getPlanForDay(req: Request, res: Response): Promise<void> {
  const { id, week, day } = req.params;

  const trainingWeekIndex = Number(week);
  const trainingDayIndex = Number(day);

  const user = await userManager.getUser(req, res);

  const trainingPlan = await trainingPlanManager.findTrainingPlanById(req, res, id);

  if (trainingWeekIndex > trainingPlan.trainingWeeks.length - 1) {
    throw new ValidationError('Die angefragte Woche gibt es nicht im Trainingsplan bitte erhöhe die Blocklänge');
  }

  const trainingWeek = trainingPlan.trainingWeeks[trainingWeekIndex];
  if (trainingDayIndex > trainingWeek.trainingDays.length - 1) {
    throw new ValidationError('Der angefragte Tag ist zu hoch für die angegebene Trainingsfrequenz');
  }

  const trainingDay = trainingWeek.trainingDays[trainingDayIndex];

  let previousTrainingDay = {};

  if (trainingPlan.weightRecommandationBase === WeightRecommendationBase.LASTWEEK && trainingWeekIndex > 0) {
    previousTrainingDay = trainingPlan.trainingWeeks[trainingWeekIndex - 1].trainingDays[trainingDayIndex];
  }

  const trainingPlanForTrainingDay = {
    title: trainingPlan.title,
    trainingFrequency: trainingPlan.trainingFrequency,
    trainingBlockLength: trainingPlan.trainingWeeks.length,
    trainingDay,
    previousTrainingDay
  };

  const trainingPlanIndex = trainingService.findTrainingPlanIndexById(user.trainingPlans, id);
  const trainingMetaData = new TrainingDayDataLocator(user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex);
  trainingSessionManager.addOrUpdateTracker(trainingMetaData);

  res.status(200).json(trainingPlanForTrainingDay);
}

/**
 * Updates the training data for a specific day in a training plan. The update affects not only
 * the specified day but can also propagate to the same day in subsequent weeks, maintaining consistency.
 */
export async function updateTrainingDataForTrainingDay(req: Request, res: Response) {
  const userDAO = getUserGenericDAO(req);
  const trainingPlanId = req.params.id;
  const trainingWeekIndex = Number(req.params.week);
  const trainingDayIndex = Number(req.params.day);

  if (isNaN(trainingWeekIndex) || isNaN(trainingDayIndex)) {
    return res.status(400).json({ error: 'Ungültige Woche oder Tag Index' });
  }

  const changedData: ApiData = req.body;

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);
  trainingPlan.lastUpdated = new Date();

  const trainingDay = trainingPlan.trainingWeeks[trainingWeekIndex]?.trainingDays[trainingDayIndex];

  updateTrainingDay(trainingDay, changedData);
  propagateChangesToFutureWeeks(trainingPlan, trainingWeekIndex, trainingDayIndex, changedData);

  await userDAO.update(user);

  for (const [fieldName, fieldValue] of Object.entries(changedData)) {
    if (isTrainingActivitySignal(fieldName, fieldValue)) {
      const trainingPlanIndex = trainingService.findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
      const trainingMetaData = new TrainingDayDataLocator(user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex);

      const trainingSessionTracker = await trainingSessionManager.addOrUpdateTracker(trainingMetaData);
      trainingSessionTracker.handleActivitySignal();
      break;
    }
  }

  res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert', trainingDay });
}

function isTrainingActivitySignal(fieldName: string, fieldValue: string): boolean {
  return (fieldName.endsWith('weight') && !!fieldValue) || (fieldName.endsWith('actualRPE') && !!fieldValue);
}

/**
 * Fetches the latest day with recorded weight data from the specified training plan.
 * This is particularly useful for resuming or reviewing recent training progress.
 */
export async function getLatestTrainingDay(req: Request, res: Response) {
  const trainingPlanId = req.params.id;

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

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
