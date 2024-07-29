import express from 'express';
import * as trainingController from '../controller/trainingController.js';
import { authService } from '../service/authService.js';
import { findTrainingPlanIndexById } from '../service/trainingService.js';
import { TrainingPlan } from '../../../shared/models/training/trainingPlan.js';
import { ExerciseCategories } from '../utils/ExerciseCategores.js';

const router = express.Router();

router.get('/plans', authService.authenticationMiddleware, trainingController.getPlans);
router.post('/create', authService.authenticationMiddleware, trainingController.createPlan);
router.delete('/delete/:planId', authService.authenticationMiddleware, trainingController.deletePlan);
router.get('/edit/:id', authService.authenticationMiddleware, trainingController.getPlanForEdit);
router.patch('/edit/:id', authService.authenticationMiddleware, trainingController.updatePlan);
router.get('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getPlanForDay);
router.patch('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getTrainingPlan);

router.get('/plan/:id/latest', authService.authenticationMiddleware, trainingController.getLatestTrainingPlan);

router.get('statistics/plan/:id', authService.authenticationMiddleware, async (req, res) => {
  const userClaimsSet = res.locals.user;
  const trainingPlanId = req.params.id;
  const exerciseCategoryParam = req.query.category as string;

  const exerciseCategory = mapExerciseCategoryParam(exerciseCategoryParam);

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

    const exerciseData = prepareTrainingWeeksForExercise(trainingPlan, exerciseCategory);

    res.status(200).json({ exerciseData });
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Abrufen der Statistiken aufgetreten ' + error;
    console.error(errMessage);
    res.status(500).json({ error: errMessage });
  }
});

function prepareTrainingWeeksForExercise(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategories) {
  const results: unknown[] = [];

  trainingPlan.trainingWeeks.forEach((week, weekIndex) => {
    let movedWeightForCategory: number = 0;
    let totalSetsForCategory: number = 0;
    let rpeSum: number = 0;

    week.trainingDays.forEach(trainingDay => {
      trainingDay.exercises.forEach(exercise => {
        if (exercise.category === exerciseCategory) {
          const weight = typeof exercise.weight === 'string' ? parseFloat(exercise.weight) : exercise.weight;
          if (!isNaN(weight)) {
            movedWeightForCategory += exercise.sets * exercise.reps * weight;
            totalSetsForCategory += exercise.sets;
            rpeSum += exercise.actualRPE * exercise.sets;
          }
        }
      });
    });

    const averageRPE = totalSetsForCategory ? rpeSum / totalSetsForCategory : 0;

    results.push({
      week: weekIndex + 1,
      movedWeightForCategory,
      totalSetsForCategory,
      averageRPE
    });
  });

  return results;
}

function mapExerciseCategoryParam(categoryParam: string): ExerciseCategories {
  switch (categoryParam.toLowerCase()) {
    case 'squat':
      return ExerciseCategories.SQUAT;
    case 'bench':
      return ExerciseCategories.BENCH;
    case 'deadlift':
      return ExerciseCategories.DEADLIFT;
    case 'overheadpress':
      return ExerciseCategories.OVERHEADPRESS;
    case 'chest':
      return ExerciseCategories.CHEST;
    case 'back':
      return ExerciseCategories.BACK;
    case 'shoulder':
      return ExerciseCategories.SHOULDER;
    case 'triceps':
      return ExerciseCategories.TRICEPS;
    case 'biceps':
      return ExerciseCategories.BICEPS;
    case 'legs':
      return ExerciseCategories.LEGS;
    default:
      throw new Error(`Invalid exercise category: ${categoryParam}`);
  }
}

export default router;
