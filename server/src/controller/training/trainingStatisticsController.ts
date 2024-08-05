import { Request, Response } from 'express';
import { getUser } from '../../service/userService.js';
import * as trainingService from '../../service/trainingService.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { User } from '../../models/collections/user/user.js';
import { mapToExerciseCategory } from '../../utils/exerciseUtils.js';
import { Exercise } from '../../models/training/exercise.js';

/**
 * Updates the list of recently viewed exercise categories for the statistics section of a specific training plan.
 */
export async function updateViewedCategories(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  trainingPlan.recentlyViewedCategoriesInStatisticSection = exerciseCategories;

  await userDAO.update(user);

  res.status(200).json('Kategorien geupdated');
}

/**
 * Retrieves the list of recently viewed exercise categories for the statistics section of a specific training plan.
 */
export async function getViewedCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  res.status(200).json(trainingPlan.recentlyViewedCategoriesInStatisticSection ?? ['Squat', 'Bench', 'Deadlift']);
}

/**
 * Retrieves the number of sets per week for the specified exercise categories in a specific training plan.
 */
export async function getSetsForCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const responseData: { [key: string]: number[] } = {};

  exerciseCategories.forEach(category => {
    const exerciseCategory = mapToExerciseCategory(category);
    if (exerciseCategory) {
      responseData[category.toLowerCase()] = getSetsPerWeek(trainingPlan, exerciseCategory);
    }
  });

  res.status(200).json(responseData);
}

/**
 * Retrieves tonnage data for specific exercise categories in a specific training plan.
 */
export async function getTonnageForCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const responseData: { [key: string]: ReturnType<typeof prepareTrainingWeeksForExercise> } = {};

  exerciseCategories.forEach(category => {
    const exerciseCategory = mapToExerciseCategory(category);
    if (exerciseCategory) {
      responseData[category.toLowerCase()] = prepareTrainingWeeksForExercise(trainingPlan, exerciseCategory);
    }
  });

  res.status(200).json(responseData);
}

/**
 * Retrieves detailed drill-down statistics for a specific exercise category and week in a training plan.
 */
export async function getDrilldownForCategory(req: Request, res: Response): Promise<Response> {
  const trainingPlanId = req.params.id;
  const weekIndex = parseInt(req.params.week, 10);
  const category = req.params.category;

  const mappedCategory = mapToExerciseCategory(category);

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const trainingWeek = trainingPlan.trainingWeeks[weekIndex];

  if (!trainingWeek) {
    return res.status(404).json({ message: 'Ungültige Trainingswoche' });
  }

  const tonnageMap = new Map();

  trainingWeek.trainingDays.forEach((trainingDay: TrainingDay) => {
    trainingDay.exercises.forEach((exercise: Exercise) => {
      if (exercise.category === mappedCategory) {
        const weight = parseFloat(exercise.weight) || 0;
        const exerciseTonnage = exercise.sets * exercise.reps * weight;

        if (tonnageMap.has(exercise.exercise)) {
          tonnageMap.set(exercise.exercise, tonnageMap.get(exercise.exercise) + exerciseTonnage);
        } else {
          tonnageMap.set(exercise.exercise, exerciseTonnage);
        }
      }
    });
  });

  const tonnageArray = Array.from(tonnageMap, ([exercise, tonnage]) => ({ exercise, tonnage }));

  return res.status(200).json({ category, week: weekIndex, exercises: tonnageArray });
}

/**
 * Calculates the number of sets per week for a specific exercise category in a training plan.
 */
function getSetsPerWeek(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategoryType): number[] {
  return trainingPlan.trainingWeeks.map(week => {
    let sets = 0;

    week.trainingDays.forEach(trainingDay => {
      trainingDay.exercises.forEach(exercise => {
        if (exercise.category === exerciseCategory) {
          sets += exercise.sets;
        }
      });
    });

    return sets;
  });
}

/**
 * Prepares tonnage data for a specific exercise category over the training weeks in a training plan.
 */
function prepareTrainingWeeksForExercise(
  trainingPlan: TrainingPlan,
  exerciseCategory: ExerciseCategoryType
): { tonnageInCategory: number }[] {
  return trainingPlan.trainingWeeks.map(week => {
    let tonnageInCategory = 0;

    week.trainingDays.forEach(trainingDay => {
      trainingDay.exercises.forEach((exercise: Exercise) => {
        if (exercise.category === exerciseCategory) {
          const weight = parseFloat(exercise.weight) || 0;
          tonnageInCategory += exercise.sets * exercise.reps * weight;
        }
      });
    });

    return {
      tonnageInCategory
    };
  });
}
