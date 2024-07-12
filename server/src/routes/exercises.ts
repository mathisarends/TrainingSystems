import express from 'express';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { User } from '@shared/models/user.js';
import { authService } from '../service/authService.js';
const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  const exercisesData = prepareExercisesData(user);
  res.status(200).json({ exercisesData });
});
/* router.patch('/', authService.authenticationMiddleware, async (req, res) => {});
router.post('/reset', authService.authenticationMiddleware, async (req, res) => {}); */

/**
 * Prepares exercise data for rendering on the client side.
 *
 * @param {Object} user - The user object containing exercise fields for different categories.
 * @returns {Object} An object containing prepared exercise data for rendering.
 * @property {string} userID - The user ID.
 * @property {string[]} exerciseCategories - An array of exercise categories.
 * @property {Record<string, string[]>} categorizedExercises - A record mapping each category to an array of exercise names.
 * @property {Record<string, number>} categoryPauseTimes - A record mapping each category to its corresponding pause time.
 * @property {Record<string, number | undefined>} maxFactors - A record mapping each exercise name to its max factor.
 * @property {Record<string, { defaultSets: number; defaultReps: number; defaultRPE: number }>} defaultRepSchemeByCategory - A record mapping each category to its default rep scheme.
 */
export function prepareExercisesData(user: User) {
  const categorizedExercises: Record<string, string[]> = {};
  const categoryPauseTimes: Record<string, number> = {};
  const maxFactors: Record<string, number | undefined> = {};
  const defaultRepSchemeByCategory: Record<string, { defaultSets: number; defaultReps: number; defaultRPE: number }> =
    {};

  const allCategorysArray = [
    user.placeholderExercises,
    user.squatExercises,
    user.benchExercises,
    user.deadliftExercises,
    user.overheadpressExercises,
    user.backExercises,
    user.chestExercises,
    user.shoulderExercises,
    user.bicepsExercises,
    user.tricepsExercises,
    user.legExercises
  ];

  for (const categoryArray of allCategorysArray) {
    const exercises = Array.isArray(categoryArray) ? categoryArray : [categoryArray]; // Umwandelung in Array für iteration

    for (const exercise of exercises) {
      if (exercise && exercise.category.name) {
        const categoryName = exercise.category.name;

        if (!categorizedExercises[categoryName]) {
          categorizedExercises[categoryName] = [];
        }
        categorizedExercises[categoryName].push(exercise.name);

        if (!categoryPauseTimes[categoryName]) {
          categoryPauseTimes[categoryName] = exercise.category.pauseTime!;
        }

        // Max Factors pro Übung
        maxFactors[exercise.name] = exercise.maxFactor;

        if (!defaultRepSchemeByCategory[categoryName]) {
          defaultRepSchemeByCategory[categoryName] = {
            defaultSets: exercise.category.defaultSets!,
            defaultReps: exercise.category.defaultReps!,
            defaultRPE: exercise.category.defaultRPE!
          };
        }
      } else {
        // Potential errors:
        // 1. Exercise object might be undefined or null.
        // 2. Exercise object might not have a category.
        // 3. Exercise category might not have a name.
        // Logging can help identify which part is causing the issue.
        console.error('Exercise or exercise category is undefined:', exercise);
      }
    }
  }

  return {
    exerciseCategories: Object.keys(categorizedExercises),
    categoryPauseTimes,
    categorizedExercises,
    defaultRepSchemeByCategory,
    maxFactors
  };
}

export default router;
