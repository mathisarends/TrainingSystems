import express from 'express';
import * as trainingController from '../controller/trainingController.js';
import { authService } from '../service/authService.js';
import { findTrainingPlanById } from '../service/trainingService.js';
import { TrainingPlan } from '../../../shared/models/training/trainingPlan.js';
import { ExerciseCategories } from '../utils/ExerciseCategores.js';
import { mapToExerciseCategory } from './exerciseRoutes.js';
import { TrainingDay } from '@shared/models/training/trainingDay.js';
import { Exercise } from '@shared/models/training/exercise.js';
import { getUser } from '../service/userService.js';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { User } from '@shared/models/user.js';

const router = express.Router();

/** Lädt eine Kartenansicht mit allen Trainingspplänen */
router.get('/plans', authService.authenticationMiddleware, trainingController.getPlans);
router.post('/create', authService.authenticationMiddleware, trainingController.createPlan);
router.delete('/delete/:planId', authService.authenticationMiddleware, trainingController.deletePlan);
router.get('/edit/:id', authService.authenticationMiddleware, trainingController.getPlanForEdit);
router.patch('/edit/:id', authService.authenticationMiddleware, trainingController.updatePlan);
router.get('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getPlanForDay);
router.patch('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getTrainingPlan);

router.get('/plan/:id/latest', authService.authenticationMiddleware, trainingController.getLatestTrainingPlan);

router.post('/statistics/:id/viewedCategories', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  try {
    const user = await getUser(req, res);

    const trainingPlan = findTrainingPlanById(user.trainingPlans, trainingPlanId);

    trainingPlan.recentlyViewedCategoriesInStatisticSection = exerciseCategories;

    await userDAO.update(user);

    res.status(200).json('Kategorien geupdated');
  } catch (error) {
    const errMessage = 'Fehler beim Setzen der zuletzt besuchten Kategorien ' + error;
    res.status(500).json(errMessage);
  }
});

router.get('/statistics/:id/viewedCategories', authService.authenticationMiddleware, async (req, res) => {
  const trainingPlanId = req.params.id;

  try {
    const user = await getUser(req, res);

    const trainingPlan = findTrainingPlanById(user.trainingPlans, trainingPlanId);

    res.status(200).json(trainingPlan.recentlyViewedCategoriesInStatisticSection ?? ['Squat', 'Bench', 'Deadlift']);
  } catch (error) {
    const errMessage = 'Fehler beim Abrufen der zuletzt besuchten Kategorien ' + error;
    res.status(500).json(errMessage);
  }
});

router.get('/statistics/:id/sets', authService.authenticationMiddleware, async (req, res) => {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  try {
    const user = await getUser(req, res);

    const trainingPlan = findTrainingPlanById(user.trainingPlans, trainingPlanId);

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
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  try {
    const user = await getUser(req, res);

    const trainingPlan = findTrainingPlanById(user.trainingPlans, trainingPlanId);

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

router.get('/statistics/:id/drilldown/:category/:week', authService.authenticationMiddleware, async (req, res) => {
  const trainingPlanId = req.params.id;
  const weekIndex = parseInt(req.params.week, 10);
  const category = req.params.category;

  try {
    // TOOO: warum werden exercises nicht mit einem enum abgespeichert wie liegen die da in der datenbank?
    const mappedCategory = mapToExerciseCategory(category);

    const user = await getUser(req, res);

    const trainingPlan = findTrainingPlanById(user.trainingPlans, trainingPlanId);

    const trainingWeek = trainingPlan.trainingWeeks[weekIndex];

    if (!trainingWeek) {
      return res.status(404).json({ message: 'Ungültige Trainingswoche' });
    }

    const tonnageMap = new Map();

    // Berechne die Tonnage für jede Übung in der spezifischen Kategorie und Woche
    trainingWeek.trainingDays.forEach((trainingDay: TrainingDay) => {
      trainingDay.exercises.forEach((exercise: Exercise) => {
        console.log('🚀 ~ trainingDay.exercises.forEach ~ exercise:', exercise);
        if (exercise.category === mappedCategory) {
          const weight = parseFloat(exercise.weight) || 0;
          const exerciseTonnage = exercise.sets * exercise.reps * weight;

          // Wenn die Übung bereits in der Map existiert, addiere die Tonnage
          if (tonnageMap.has(exercise.exercise)) {
            tonnageMap.set(exercise.exercise, tonnageMap.get(exercise.exercise) + exerciseTonnage);
          } else {
            tonnageMap.set(exercise.exercise, exerciseTonnage);
          }
        }
      });
    });

    // Konvertiere die Map in ein Array von Objekten für die JSON-Antwort
    const tonnageArray = Array.from(tonnageMap, ([exercise, tonnage]) => ({ exercise, tonnage }));

    res.status(200).json({ category, week: weekIndex, exercises: tonnageArray });
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Abrufen der Drilldown-Statistiken aufgetreten: ' + error;
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
