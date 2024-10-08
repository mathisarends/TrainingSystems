import { Request, Response } from 'express';
import { ApiData } from '../models/apiData.js';
import { UserExercise } from '../models/collections/user/user-exercise.js';
import { ExerciseCategoryType } from '../models/training/exercise-category-type.js';
import userManager from '../service/userManager.js';
import {
  getExerciseFieldByCategory,
  mapChangedDataToCategories,
  mapToExerciseCategory,
  prepareExercisesData,
  processExerciseChanges,
  resetUserExercises
} from '../utils/exerciseUtils.js';

/**
 * Fetches all exercise categories.
 */
export function getCategories(req: Request, res: Response): void {
  const categories = Object.values(ExerciseCategoryType).filter(
    category => category !== ExerciseCategoryType.PLACEHOLDER
  );
  res.status(200).json(categories);
}

/**
 * Fetches exercises by category.
 */
export async function getExercisesByCategory(req: Request, res: Response): Promise<void> {
  const category = req.params.category;

  const user = await userManager.getUser(res);
  const mappedCategory = mapToExerciseCategory(category);
  const exerciseNames = getExerciseFieldByCategory(mappedCategory, user).map((exercise: UserExercise) => exercise.name);

  res.status(200).json(exerciseNames);
}

/**
 * Fetches all exercises data for the user.
 */
export async function getExercises(req: Request, res: Response): Promise<void> {
  const user = await userManager.getUser(res);
  const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory, maxFactors } =
    prepareExercisesData(user);

  res.status(200).json({
    exerciseCategories,
    categoryPauseTimes,
    categorizedExercises,
    defaultRepSchemeByCategory,
    maxFactors
  });
}

/**
 * Updates exercises for the user based on provided data.
 */
export async function updateExercises(req: Request, res: Response): Promise<void> {
  const changedData: ApiData = req.body;
  const user = await userManager.getUser(res);
  const changedCategoriesMap = mapChangedDataToCategories(changedData);

  Object.entries(changedCategoriesMap).forEach(([category, { fieldNames, newValues }]) => {
    const userExerciseField = getExerciseFieldByCategory(category as ExerciseCategoryType, user);

    for (let index = 0; index < fieldNames.length; index++) {
      processExerciseChanges(fieldNames[index], index, newValues, userExerciseField);
    }
  });

  await userManager.update(user);
  res.status(200).json({ message: 'Erfolgreich aktualisiert.' });
}

/**
 * Resets the user's exercise catalog to default values.
 */
export async function resetExercises(req: Request, res: Response): Promise<void> {
  const user = await userManager.getUser(res);
  resetUserExercises(user);

  await userManager.update(user);

  res.status(200).json({ message: 'Übungskatalog zurückgesetzt!' });
}
