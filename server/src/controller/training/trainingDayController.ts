import { Request, Response } from 'express';
import { getUser } from '../../service/userService.js';
import * as trainingService from '../../service/trainingService.js';
import { TrainingDay } from '../../models/training/trainingDay.js';

import {
  createExerciseObject,
  findLatestTrainingDayWithWeight,
  updateExercise
} from '../../service/trainingService.js';
import { Exercise } from '../../models/training/exercise.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';

import { findTrainingPlanById } from '../../service/trainingService.js';
import { WeightRecommendationBase } from '../../models/training/weight-recommandation.enum.js';
import { TrainingSessionManager } from './training-session-manager.js';
import { TrainingDayDataLocator } from './training-day-data-locator.js';
import { ApiData } from '../../models/apiData.js';

import { v4 as uuidv4 } from 'uuid';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { User } from '../../models/collections/user/user.js';

const trainingSessionManager = new TrainingSessionManager();

/**
 * Updates an existing training plan based on user input. Adjustments can include changes
 * to the plan's title, frequency, and week structure. It also handles differences in the
 * number of weeks by either adding or removing weeks from the plan.
 */
export async function getPlanForDay(req: Request, res: Response): Promise<void> {
  const { id, week, day } = req.params;

  const trainingWeekIndex = Number(week);
  const trainingDayIndex = Number(day);

  const user = await getUser(req, res);

  const trainingPlan = findTrainingPlanById(user.trainingPlans, id);

  if (trainingWeekIndex > trainingPlan.trainingWeeks.length) {
    throw new Error('Die angefragte Woche gibt es nicht im Trainingsplan bitte erhöhe die Blocklänge');
  }

  const trainingWeek = trainingPlan.trainingWeeks[trainingWeekIndex];
  if (trainingDayIndex > trainingWeek.trainingDays.length) {
    throw new Error('Der angefragte Tag ist zu hoch für die angegebene Trainingsfrequenz');
  }

  const userDAO = req.app.locals.userDAO as MongoGenericDAO<User>;

  // TODO: TEMPORARY FOR MIGRATION PURPOSES TODO: REMOVE
  for (const trainingWeek of trainingPlan.trainingWeeks) {
    for (const trainingDay of trainingWeek.trainingDays) {
      if (!trainingDay.id) {
        trainingDay.id = uuidv4();
      }
    }
  }

  await userDAO.update(user);

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

  res.status(200).json(trainingPlanForTrainingDay);
}

/**
 * Updates the training data for a specific day in a training plan. The update affects not only
 * the specified day but can also propagate to the same day in subsequent weeks, maintaining consistency.
 */
export async function updateTrainingDataForTrainingDay(req: Request, res: Response) {
  const userDAO = req.app.locals.userDAO;
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

  updateTrainingDay(trainingDay, changedData, trainingDayIndex);
  propagateChangesToFutureWeeks(trainingPlan, trainingWeekIndex, trainingDayIndex, changedData);

  await userDAO.update(user);

  const trainingPlanIndex = trainingService.findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
  const trainingMetaData = new TrainingDayDataLocator(user, trainingPlanIndex, trainingWeekIndex, trainingDayIndex);

  await trainingSessionManager.addOrUpdateTracker(userDAO, trainingMetaData);
  trainingSessionManager.handleActivitySignals(trainingDay.id, changedData);

  res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert', trainingDay });
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
 * @param trainingDayIndex - The index of the day being updated.
 */
function updateTrainingDay(trainingDay: TrainingDay, changedData: ApiData, trainingDayIndex: number): void {
  for (const [fieldName, fieldValue] of Object.entries(changedData)) {
    const dayIndex = parseInt(fieldName.charAt(3));

    if (dayIndex !== trainingDayIndex) {
      throw new Error('Die gesendeten Daten passen logisch nicht auf die angegebene Trainingswoche');
    }

    const exerciseIndex = parseInt(fieldName.charAt(13));
    const exercise = trainingDay.exercises[exerciseIndex - 1];

    // If no exercise exists and the field indicates a new category, create a new exercise
    if (!exercise && fieldName.endsWith('category')) {
      const newExercise = createExerciseObject(fieldName, fieldValue) as Exercise;
      trainingDay.exercises.push(newExercise);
    }

    if (exercise) {
      updateExercise(fieldName, fieldValue, exercise, trainingDay, exerciseIndex);
    }
  }
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
    const trainingDayInLaterWeek = trainingPlan.trainingWeeks[tempWeekIndex].trainingDays[
      trainingDayIndex
    ] as TrainingDay;

    for (const [fieldName, fieldValue] of Object.entries(changedData)) {
      const exerciseIndex = parseInt(fieldName.charAt(13));
      const exerciseInLaterWeek = trainingDayInLaterWeek.exercises[exerciseIndex - 1] as Exercise;

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
