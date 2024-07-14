import express from 'express';
import * as exerciseController from '../controller/exerciseController.js';
import { authService } from '../service/authService.js';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { User } from '@shared/models/user.js';
import { prepareExercisesData } from '../utils/exerciseUtils.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, exerciseController.getExercises);
router.patch('/', authService.authenticationMiddleware, exerciseController.updateExercises);
router.post('/reset', authService.authenticationMiddleware, exerciseController.resetExercises);

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
