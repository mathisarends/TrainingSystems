import express from 'express';
import * as exerciseController from '../controller/exerciseController.js';
import { authService } from '../service/authService.js';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { User } from '@shared/models/user.js';
import { getExerciseFieldByCategory, prepareExercisesData } from '../utils/exerciseUtils.js';
import { ExerciseCategories } from '../utils/ExerciseCategores.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, exerciseController.getExercises);
router.patch('/', authService.authenticationMiddleware, exerciseController.updateExercises);
router.post('/reset', authService.authenticationMiddleware, exerciseController.resetExercises);

router.get('/categories', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  try {
    const user = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    const categories = Object.values(ExerciseCategories).filter(
      category => category !== ExerciseCategories.PLACEHOLDER
    );

    res.status(200).json(categories);
  } catch (error) {
    const errMessage = 'Fehler beim Abrufen der Kategorien ' + error;
    res.status(500).json(errMessage);
  }
});

// TODO: hier mit query parameter die category übergeben und danach entsprechend filtern dann
router.get('/exercises/:category', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;
  const category = req.params.category;

  try {
    const user = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    const mappedCategory = mapToExerciseCategory(category);

    const exerciseNames = getExerciseFieldByCategory(mappedCategory, user).map(exercise => exercise.name);

    res.status(200).json(exerciseNames);
  } catch (error) {
    const errMessage = 'Fehler beim Abrufen der Kategorien ' + error;
    res.status(500).json(errMessage);
  }
});

router.get('/training', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory, maxFactors } =
    prepareExercisesData(user);

  res.status(200).json({
    exerciseCategories,
    categoryPauseTimes,
    categorizedExercises,
    defaultRepSchemeByCategory,
    maxFactors
  });
});

export default router;
