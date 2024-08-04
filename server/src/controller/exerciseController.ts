import { Request, Response } from 'express';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';
import { User } from '../models/collections/user.js';
import { ApiData } from '../models/apiData.js';
import { getUser } from '../service/userService.js';
import {
  getExerciseFieldByCategory,
  mapChangedDataToCategories,
  prepareExercisesData,
  processExerciseChanges,
  resetUserExercises,
  mapToExerciseCategory
} from '../utils/exerciseUtils.js';
import { ExerciseCategoryType } from '../utils/exercise-category.js';
import { UserExercise } from '../models/exercise/user-exercise.js';

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

  const user = await getUser(req, res);
  const mappedCategory = mapToExerciseCategory(category);
  const exerciseNames = getExerciseFieldByCategory(mappedCategory, user).map((exercise: UserExercise) => exercise.name);

  res.status(200).json(exerciseNames);
}

/**
 * Fetches all exercises data for the user.
 */
export async function getExercises(req: Request, res: Response): Promise<void> {
  try {
    const user = await getUser(req, res);
    const exercisesData = prepareExercisesData(user);
    res.status(200).json({ exercisesData });
  } catch (error) {
    res.status(404).json({ error: (error as unknown as Error).message });
  }
}

/**
 * Updates exercises for the user based on provided data.
 */
export async function updateExercises(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  try {
    const changedData: ApiData = req.body;
    const user = await getUser(req, res);
    const changedCategoriesMap = mapChangedDataToCategories(changedData);

    Object.entries(changedCategoriesMap).forEach(([category, { fieldNames, newValues }]) => {
      const userExerciseField = getExerciseFieldByCategory(category as ExerciseCategoryType, user);

      for (let index = 0; index < fieldNames.length; index++) {
        processExerciseChanges(fieldNames[index], index, newValues, userExerciseField);
      }
    });

    await userDAO.update(user);
    res.status(200).json({ message: 'Erfolgreich aktualisiert.' });
  } catch (error) {
    console.error('An error occurred while updating user exercises', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Aktualisieren der Benutzerübungen.' });
  }
}

/**
 * Resets the user's exercise catalog to default values.
 */
export async function resetExercises(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  try {
    const user = await getUser(req, res);
    resetUserExercises(user);
    await userDAO.update(user);
    res.status(200).json({ message: 'Übungskatalog zurückgesetzt!' });
  } catch (error) {
    console.error('An error occurred while resetting user exercises', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Zurücksetzen der Benutzerübungen.' });
  }
}
