import express from 'express';
import * as trainingController from '../controller/trainingController.js';
import { authService } from '../service/authService.js';
import { findTrainingPlanIndexById } from '../service/trainingService.js';
import { TrainingPlan } from '../../../shared/models/training/trainingPlan.js';
import { ExerciseCategories } from '../utils/ExerciseCategores.js';
import { mapToExerciseCategory } from './exerciseRoutes.js';

const router = express.Router();

router.get('/plans', authService.authenticationMiddleware, trainingController.getPlans);
router.post('/create', authService.authenticationMiddleware, trainingController.createPlan);
router.delete('/delete/:planId', authService.authenticationMiddleware, trainingController.deletePlan);
router.get('/edit/:id', authService.authenticationMiddleware, trainingController.getPlanForEdit);
router.patch('/edit/:id', authService.authenticationMiddleware, trainingController.updatePlan);
router.get('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getPlanForDay);
router.patch('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getTrainingPlan);

router.get('/plan/:id/latest', authService.authenticationMiddleware, trainingController.getLatestTrainingPlan);

router.post('/statistics/:id/viewedCategories', authService.authenticationMiddleware, async (req, res) => {
  const userClaimsSet = res.locals.user;
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  try {
    const userDAO = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
    if (trainingPlanIndex === -1) {
      return res.status(404).json({ message: 'No training plan was found for the given URL' });
    }

    const trainingPlan = user.trainingPlans[trainingPlanIndex];
    trainingPlan.recentlyViewedCategoriesInStatisticSection = exerciseCategories;

    await userDAO.update(user);

    res.status(200).json('Kategorien geupdated');
  } catch (error) {
    const errMessage = 'Fehler beim Setzen der zuletzt besuchten Kategorien ' + error;
    res.status(500).json(errMessage);
  }
});

router.get('/statistics/:id/viewedCategories', authService.authenticationMiddleware, async (req, res) => {
  const userClaimsSet = res.locals.user;
  const trainingPlanId = req.params.id;

  try {
    const userDAO = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
    if (trainingPlanIndex === -1) {
      return res.status(404).json({ message: 'No training plan was found for the given URL' });
    }

    const trainingPlan = user.trainingPlans[trainingPlanIndex];

    res.status(200).json(trainingPlan.recentlyViewedCategoriesInStatisticSection ?? ['Squat', 'Bench', 'Deadlift']);
  } catch (error) {
    const errMessage = 'Fehler beim Abrufen der zuletzt besuchten Kategorien ' + error;
    res.status(500).json(errMessage);
  }
});

router.get('/statistics/:id/sets', authService.authenticationMiddleware, async (req, res) => {
  const userClaimsSet = res.locals.user;
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  try {
    const userDAO = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
    if (trainingPlanIndex === -1) {
      return res.status(404).json({ message: 'No training plan was found for the given URL' });
    }

    const trainingPlan = user.trainingPlans[trainingPlanIndex];
    // Define the structure of the response data
    const responseData: { [key: string]: number[] } = {};

    // Process the exercise categories
    exerciseCategories.forEach(category => {
      const exerciseCategory = mapToExerciseCategory(category); // Use the mapping function
      if (exerciseCategory) {
        responseData[category.toLowerCase()] = getSetsPerWeek(trainingPlan, exerciseCategory);
      }
    });

    res.status(200).json(responseData);
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Abrufen der Statistiken aufgetreten ' + error;
    console.error(errMessage);
    res.status(500).json({ error: errMessage });
  }
});

// gets tonnage for squat, bench and deadlift
router.get('/statistics/:id', authService.authenticationMiddleware, async (req, res) => {
  const userClaimsSet = res.locals.user;
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  try {
    const userDAO = req.app.locals.userDAO;
    const user = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
    if (trainingPlanIndex === -1) {
      return res.status(404).json({ message: 'No training plan was found for the given URL' });
    }

    const trainingPlan = user.trainingPlans[trainingPlanIndex];
    // Define the structure of the response data
    const responseData: { [key: string]: ReturnType<typeof prepareTrainingWeeksForExercise> } = {};

    // Process the exercise categories
    exerciseCategories.forEach(category => {
      const exerciseCategory = mapToExerciseCategory(category); // Use the mapping function
      if (exerciseCategory) {
        responseData[category.toLowerCase()] = prepareTrainingWeeksForExercise(trainingPlan, exerciseCategory);
      }
    });
    res.status(200).json(responseData);
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Abrufen der Statistiken aufgetreten ' + error;
    console.error(errMessage);
    res.status(500).json({ error: errMessage });
  }
});

function getSetsPerWeek(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategories) {
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

// Prepare tonnage data for a specific exercise category over the training weeks
function prepareTrainingWeeksForExercise(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategories) {
  return trainingPlan.trainingWeeks.map(week => {
    let tonnageInCategory = 0;

    week.trainingDays.forEach(trainingDay => {
      trainingDay.exercises.forEach(exercise => {
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

export default router;
