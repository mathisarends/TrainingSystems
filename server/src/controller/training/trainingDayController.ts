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
import { TrainingWeek } from '../../models/training/trainingWeek.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';

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
 * Automatically progresses a training plan based on the user's input.
 * Handles deload phases and adjusts RPE for each exercise.
 */
export async function autoProgressionForTrainingPlan(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const planDeload = req.query.deload === 'true';

  const userDAO = req.app.locals.userDAO;
  const user = await getUser(req, res);

  const trainingPlan = findTrainingPlanById(user.trainingPlans, id);

  trainingPlan.trainingWeeks.forEach((trainingWeek, weekIndex) => {
    if (planDeload && isLastWeek(trainingPlan, weekIndex)) {
      handleDeloadWeek(trainingPlan, weekIndex);
    } else if (weekIndex !== 0) {
      adjustRPEForWeek(trainingPlan, weekIndex);
    }
  });

  await userDAO.save(user);

  res.status(200).json('Automatic Progression completed');
}

/**
 * Determines if the current week is the last week of the training plan.
 */
function isLastWeek(trainingPlan: TrainingPlan, weekIndex: number): boolean {
  return trainingPlan.trainingWeeks.length - 1 === weekIndex;
}

/**
 * Handles adjustments for a deload week by reducing sets and adjusting RPE.
 */
function handleDeloadWeek(trainingPlan: TrainingPlan, weekIndex: number): void {
  const lastTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];
  const deloadTrainingWeek = trainingPlan.trainingWeeks[weekIndex];

  deloadTrainingWeek.trainingDays.forEach((trainingDay, dayIndex) => {
    const trainingDayBeforeDeload = lastTrainingWeek.trainingDays[dayIndex];

    trainingDay.exercises.forEach((exercise, exerciseIndex) => {
      const exerciseBeforeDeload = trainingDayBeforeDeload.exercises[exerciseIndex];

      if (exercise.exercise === exerciseBeforeDeload.exercise) {
        exercise.sets = Math.max(exerciseBeforeDeload.sets - 1, 0); // Prevents negative sets
        exercise.targetRPE = isMainCategory(exercise.category) ? 6 : 7;
      }
    });
  });
}

/**
 * Adjusts the RPE for each exercise for the given week, capping at a maximum value.
 */
function adjustRPEForWeek(trainingPlan: TrainingPlan, weekIndex: number): void {
  const previousTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];

  trainingPlan.trainingWeeks[weekIndex].trainingDays.forEach((trainingDay, dayIndex) => {
    const previousWeekTrainingDay = previousTrainingWeek.trainingDays[dayIndex];

    trainingDay.exercises.forEach((exercise, exerciseIndex) => {
      const previousWeekExercise = previousWeekTrainingDay.exercises[exerciseIndex];

      if (exercise.exercise === previousWeekExercise.exercise) {
        const rpeMax = isMainCategory(exercise.category) ? 9 : 10;
        exercise.targetRPE = Math.min(previousWeekExercise.targetRPE + 0.5, rpeMax);
      }
    });
  });
}

/**
 * Checks if the exercise belongs to a main category (Squat, Bench, Deadlift).
 */
function isMainCategory(category: string): boolean {
  return (
    category === ExerciseCategoryType.SQUAT ||
    category === ExerciseCategoryType.BENCH ||
    category === ExerciseCategoryType.DEADLIFT
  );
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

  const changedData: Record<string, string> = req.body.body;

  const user = await getUser(req, res);
  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const trainingDay = trainingPlan.trainingWeeks[trainingWeekIndex]?.trainingDays[trainingDayIndex];

  if (!trainingDay) {
    return res.status(400).json({ error: 'Ungültige Woche oder Tag Index' });
  }

  updateTrainingDay(trainingDay, changedData, trainingDayIndex);
  propagateChangesToFutureWeeks(trainingPlan, trainingWeekIndex, trainingDayIndex, changedData);

  await userDAO.update(user);

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
function updateTrainingDay(
  trainingDay: TrainingDay,
  changedData: Record<string, string>,
  trainingDayIndex: number
): void {
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
  changedData: Record<string, string>
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
