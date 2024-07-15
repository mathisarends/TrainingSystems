import express from 'express';
import * as trainingController from '../controller/trainingController.js';
import { authService } from '../service/authService.js';
import { User } from '@shared/models/user.js';
import { findTrainingPlanIndexById } from '../service/trainingService.js';
import { Exercise } from '@shared/models/training/exercise.js';
import { TrainingDay } from '@shared/models/training/trainingDay.js';
import { TrainingPlan } from '@shared/models/training/trainingPlan.js';

const router = express.Router();

router.get('/plans', authService.authenticationMiddleware, trainingController.getPlans);
router.post('/create', authService.authenticationMiddleware, trainingController.createPlan);
router.delete('/delete/:planId', authService.authenticationMiddleware, trainingController.deletePlan);
router.get('/edit/:id', authService.authenticationMiddleware, trainingController.getPlanForEdit);
router.patch('/edit/:id', authService.authenticationMiddleware, trainingController.updatePlan);
router.get('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getPlanForDay);

router.get('/plan/:id/latest', authService.authenticationMiddleware, async (req, res) => {
  try {
    const userClaimsSet = res.locals.user;
    const trainingPlanId = req.params.id;

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

    const { weekIndex, dayIndex } = findLatestTrainingDayWithWeight(trainingPlan);
    return res.status(200).json({ weekIndex, dayIndex });
  } catch (error) {
    console.error('Error fetching latest training day:', error);
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Function to find the latest training day with weight entry
function findLatestTrainingDayWithWeight(trainingPlan: TrainingPlan) {
  for (let wIndex = trainingPlan.trainingWeeks.length - 1; wIndex >= 0; wIndex--) {
    const trainingWeek = trainingPlan.trainingWeeks[wIndex];
    for (let dIndex = trainingWeek.trainingDays.length - 1; dIndex >= 0; dIndex--) {
      const trainingDay = trainingWeek.trainingDays[dIndex];

      if (trainingDay.exercises?.some(exercise => exercise.weight)) {
        if (dIndex + 1 < trainingWeek.trainingDays.length) {
          const nextDay = trainingWeek.trainingDays[dIndex + 1];
          if (!nextDay.exercises?.some(exercise => exercise.weight)) {
            return { weekIndex: wIndex, dayIndex: dIndex };
          }
        } else if (wIndex + 1 < trainingPlan.trainingWeeks.length) {
          const nextWeek = trainingPlan.trainingWeeks[wIndex + 1];
          if (
            nextWeek.trainingDays.length > 0 &&
            !nextWeek.trainingDays[0].exercises?.some(exercise => exercise.weight)
          ) {
            return { weekIndex: wIndex, dayIndex: dIndex };
          }
        } else {
          return { weekIndex: wIndex, dayIndex: dIndex };
        }
      }
    }
  }
  return { weekIndex: 0, dayIndex: 0 };
}

router.patch('/plan/:id/:week/:day', authService.authenticationMiddleware, async (req, res) => {
  const userClaimsSet = res.locals.user;

  const trainingPlanId = req.params.id;
  const trainingWeekIndex = Number(req.params.week);
  const trainingDayIndex = Number(req.params.day);

  const userDAO = req.app.locals.userDAO;

  const changedData: Record<string, string> = req.body.body;

  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
  if (trainingPlanIndex === -1) {
    throw new Error('Ungültige Trainingsplan-ID');
  }

  const trainingPlan = user.trainingPlans[trainingPlanIndex];

  try {
    const trainingDay = trainingPlan.trainingWeeks[trainingWeekIndex].trainingDays[trainingDayIndex];

    // Iterate over the keys and values in changedData
    for (const [fieldName, fieldValue] of Object.entries(changedData)) {
      const dayIndex = parseInt(fieldName.charAt(3));

      if (dayIndex !== trainingDayIndex) {
        return res
          .status(400)
          .json({ error: 'Die gesendeten Daten passen logisch nicht auf die angegebene Trainingswoche' });
      }

      const exerciseIndex = parseInt(fieldName.charAt(13));
      const exercise = trainingDay.exercises[exerciseIndex - 1];

      // neue exercises nur erstellen, wenn es auch eine neue category ist
      if (!exercise && fieldName.endsWith('category')) {
        const newExercise = createExerciseObject(fieldName, fieldValue) as Exercise;
        trainingDay.exercises.push(newExercise);
      }

      if (exercise) {
        updateExercise(fieldName, fieldValue, exercise, trainingDay, exerciseIndex);
      }

      let tempWeekIndex = trainingWeekIndex + 1;

      // updateComingWeeksIfNotPresent (own method)
      while (tempWeekIndex < trainingPlan.trainingWeeks.length) {
        const trainingDayInLaterWeek = trainingPlan.trainingWeeks[tempWeekIndex].trainingDays[
          trainingDayIndex
        ] as TrainingDay;
        const exerciseInLaterWeek = trainingDayInLaterWeek.exercises[exerciseIndex - 1] as Exercise;

        if (!exercise) {
          const newExercise = createExerciseObject(fieldName, fieldValue) as Exercise;
          trainingDayInLaterWeek.exercises.push(newExercise);
        }

        if (exercise) {
          updateExercise(fieldName, fieldValue, exerciseInLaterWeek, trainingDayInLaterWeek, exerciseIndex);
        }

        tempWeekIndex++;
      }
    }

    await userDAO.update(user);

    res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert', trainingDay });
  } catch (error) {
    console.error('Error updating training day:', error);
    return res.status(400).json({ error: 'Plan konnte aufgrund ungültiger Parameter nicht gefunden werden ' });
  }
});
export default router;

/**
 * Creates a new Exercise object.
 * @param fieldName - The name of the field being updated.
 * @param fieldValue - The value to be assigned to the field.
 * @returns A complete Exercise object with default values.
 */
function createExerciseObject(fieldName: string, fieldValue: string): Exercise | null {
  return {
    category: fieldName.endsWith('category') ? fieldValue : '',
    exercise: '',
    sets: 0,
    reps: 0,
    weight: '',
    targetRPE: 0,
    actualRPE: 0,
    estMax: 0
  };
}

function updateExercise(
  fieldName: string,
  fieldValue: string,
  exercise: Exercise,
  trainingDay: TrainingDay,
  exerciseIndex: number
) {
  // zum löschen nachdem sie gelöscht wurde wird sie aber wieder neue erstellt!!! also funktioniert noch nicht
  if (fieldName.endsWith('category') && (fieldValue === '- Bitte Auswählen -' || fieldValue === '')) {
    trainingDay.exercises.splice(exerciseIndex - 1, 1);
    return;
  }

  switch (true) {
    case fieldName.endsWith('category'):
      exercise.category = fieldValue;
      break;
    case fieldName.endsWith('exercise_name'):
      exercise.exercise = fieldValue;
      break;
    case fieldName.endsWith('sets'):
      exercise.sets = Number(fieldValue);
      break;
    case fieldName.endsWith('reps'):
      exercise.reps = Number(fieldValue);
      break;
    case fieldName.endsWith('weight'):
      exercise.weight = fieldValue;
      break;
    case fieldName.endsWith('targetRPE'):
      exercise.targetRPE = Number(fieldValue);
      break;
    case fieldName.endsWith('actualRPE'):
      exercise.actualRPE = Number(fieldValue);
      break;
    case fieldName.endsWith('estMax'):
      exercise.estMax = Number(fieldValue);
      break;
    default:
      console.log('Dieses Feld gibt es leider nicht!');
      break;
  }
}
