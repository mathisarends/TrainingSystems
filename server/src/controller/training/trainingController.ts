import { Request, Response } from 'express';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import * as trainingService from '../../service/trainingService.js';
import { User } from '../../models/collections/user/user.js';
import {
  createNewTrainingPlanWithPlaceholders,
  findTrainingPlanById,
  handleWeekDifference
} from '../../service/trainingService.js';
import { getUser } from '../../service/userService.js';
import { TrainingPlanDtoMapper } from '../../service/training-plan-dto-mapper.js';
import { TrainingPlanCardViewDto } from '../../models/dto/training-plan-card-view-dto.js';
import { WeightRecommendationBase } from '../../models/training/weight-recommandation.enum.js';
import { v4 as uuidv4 } from 'uuid';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';

import _ from 'lodash';
/**
 * Retrieves the list of training plans for the user, summarizing them into card views.
 * The result is intended to be a lightweight representation of the user's training plans.
 */
export async function getPlans(req: Request, res: Response): Promise<void> {
  const user = await getUser(req, res);

  const trainingPlanCards: TrainingPlanCardViewDto[] = user.trainingPlans.map((plan: TrainingPlan) => ({
    ...TrainingPlanDtoMapper.getCardView(plan),
    pictureUrl: user.pictureUrl,
    percentageFinished: trainingService.getPercentageOfTrainingPlanFinished(plan),
    averageTrainingDayDuration: trainingService.getAverageTrainingDuration(plan)
  }));

  res.status(200).json({ trainingPlanCards });
}

/**
 * Creates a new training plan for the user with the specified parameters.
 * This plan includes placeholders for exercises based on the provided frequency and number of weeks.
 */
export async function createPlan(req: Request, res: Response): Promise<void> {
  const user = await getUser(req, res);
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const title = req.body.title;
  const trainingFrequency = Number(req.body.trainingFrequency);
  const trainingWeeks = Number(req.body.trainingWeeks);
  const weightRecommandation = req.body.weightPlaceholders as WeightRecommendationBase;
  const coverImage = req.body.coverImage;

  const referencePlanId = req.body.referencePlanId;
  let trainingWeeksArr;
  if (referencePlanId) {
    const trainingPlan = _.cloneDeep(findTrainingPlanById(user.trainingPlans, referencePlanId));

    trainingWeeksArr = trainingService.createNewTrainingPlanBasedOnTemplate(trainingPlan);
  } else {
    trainingWeeksArr = createNewTrainingPlanWithPlaceholders(trainingWeeks, trainingFrequency);
  }

  const newTrainingPlan: TrainingPlan = {
    id: uuidv4(),
    title,
    trainingFrequency,
    weightRecommandationBase: weightRecommandation,
    lastUpdated: new Date(),
    trainingWeeks: trainingWeeksArr,
    coverImageBase64: coverImage
  };

  user.trainingPlans.push(newTrainingPlan);
  await userDAO.update(user);

  res.status(200).json({ message: 'Plan erfolgreich erstellt' });
}

/**
 * Deletes a training plan from the user's list of training plans based on the provided plan ID.
 * This method ensures that the specified plan is removed from the user's data in the database.
 */
export async function deletePlan(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const planId = req.params.planId;

  const user = await getUser(req, res);
  const trainingPlanIndex = trainingService.findTrainingPlanIndexById(user.trainingPlans, planId);

  user.trainingPlans.splice(trainingPlanIndex, 1);
  await userDAO.update(user);

  res.status(201).json({ message: 'Trainingsplan erfolgreich gelöscht' });
}

/**
 * Retrieves a training plan for editing purposes. This method returns the plan in a format
 * that is suitable for client-side editing, typically including all details needed for modification.
 */
export async function getPlanForEdit(req: Request, res: Response): Promise<void> {
  const planId = req.params.id;

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, planId);

  const trainingPlanEditView = TrainingPlanDtoMapper.getEditView(trainingPlan);

  res.status(200).json({ trainingPlanEditView });
}

/**
 * Updates an existing training plan based on user input. Adjustments can include changes
 * to the plan's title, frequency, and week structure. It also handles differences in the
 * number of weeks by either adding or removing weeks from the plan.
 */
export async function updatePlan(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const planId = req.params.id;

  const user = await getUser(req, res);

  const trainingPlan = findTrainingPlanById(user.trainingPlans, planId);

  trainingPlan.title = req.body.title;
  trainingPlan.trainingFrequency = Number(req.body.trainingFrequency);
  trainingPlan.weightRecommandationBase = req.body.weightPlaceholders as WeightRecommendationBase;
  if (req.body.coverImage) {
    trainingPlan.coverImageBase64 = req.body.coverImage;
  }

  if (trainingPlan.trainingWeeks.length !== Number(req.body.trainingWeeks)) {
    const difference = trainingPlan.trainingWeeks.length - parseInt(req.body.trainingWeeks);
    handleWeekDifference(trainingPlan, difference);
  }

  await userDAO.update(user);
  res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert' });
}

/**
 * Automatically progresses a training plan based on the user's input.
 * Handles deload phases and adjusts RPE for each exercise.
 */
export async function autoProgressionForTrainingPlan(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const planDeload = req.query.deloadWeek === 'true';
  const rpeIncrease = parseFloat(req.query.rpeProgression as string) || 0.5; // Default to 0.5 if not provided

  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const user = await getUser(req, res);

  const trainingPlan = findTrainingPlanById(user.trainingPlans, id);

  trainingPlan.trainingWeeks.forEach((trainingWeek, weekIndex) => {
    if (planDeload && isLastWeek(trainingPlan, weekIndex)) {
      handleDeloadWeek(trainingPlan, weekIndex);
    } else if (weekIndex !== 0) {
      adjustRPEForWeek(trainingPlan, weekIndex, rpeIncrease);
    }
  });

  await userDAO.update(user);

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
        exercise.sets = Math.max(exerciseBeforeDeload.sets - 1, 0);
        exercise.targetRPE = isMainCategory(exercise.category) ? '6' : '7';
      }
    });
  });
}

/**
 * Adjusts the RPE for each exercise for the given week, using the rpeIncrease parameter.
 */
function adjustRPEForWeek(trainingPlan: TrainingPlan, weekIndex: number, rpeIncrease: number): void {
  const previousTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];

  trainingPlan.trainingWeeks[weekIndex].trainingDays.forEach((trainingDay, dayIndex) => {
    const previousWeekTrainingDay = previousTrainingWeek.trainingDays[dayIndex];

    trainingDay.exercises.forEach((exercise, exerciseIndex) => {
      const previousWeekExercise = previousWeekTrainingDay?.exercises[exerciseIndex];

      if (exercise.exercise === previousWeekExercise?.exercise) {
        if (isNumber(previousWeekExercise.targetRPE)) {
          const rpeMax = isMainCategory(exercise.category) ? 9 : 10;
          const parsedRPE = Number(previousWeekExercise.targetRPE);
          exercise.targetRPE = Math.min(parsedRPE + rpeIncrease, rpeMax).toString();
        } else {
          const rpeArray = parseStringToNumberArray(previousWeekExercise.targetRPE);

          if (rpeArray) {
            const rpeMax = isMainCategory(exercise.category) ? 9 : 10;
            const adjustedRpeArray = rpeArray.map(rpe => Math.min(rpe + rpeIncrease, rpeMax));
            exercise.targetRPE = adjustedRpeArray.join(';');
          } else {
            console.warn(`Cannot parse targetRPE for exercise: ${exercise.exercise}`);
          }
        }
      }
    });
  });
}

/**
 * Attempts to parse a string into an array of numbers if it can be split by a delimiter and parsed.

 */
function parseStringToNumberArray(value: string, delimiter: string = ';'): number[] | null {
  const parts = value.split(delimiter);
  const numbers = parts.map(part => Number(part.trim()));

  if (numbers.every(num => !isNaN(num))) {
    return numbers;
  }
  return null;
}

/**
 * Checks if a given value can be parsed as a number.
 */
function isNumber(value: string): boolean {
  const parsedNumber = Number(value);
  return !isNaN(parsedNumber);
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
