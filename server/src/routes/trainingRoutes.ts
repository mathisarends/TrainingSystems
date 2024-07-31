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

function mapToExerciseCategory(category: string): ExerciseCategories | undefined {
  switch (category.toLowerCase()) {
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
      return undefined; // In case the category does not match any enum values
  }
}
