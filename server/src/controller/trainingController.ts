import { Request, Response } from 'express';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import * as trainingService from '../service/trainingService.js';
import { User } from '@shared/models/user.js';
import {
  createExerciseObject,
  findLatestTrainingDayWithWeight,
  findTrainingPlanIndexById,
  updateExercise
} from '../service/trainingService.js';
import { TrainingDay } from '@shared/models/training/trainingDay.js';
import { Exercise } from '@shared/models/training/exercise.js';

export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const trainingPlanDtos = await trainingService.getTrainingPlans(userDAO, userClaimsSet);
    res.status(200).json({ trainingPlanDtos });
  } catch (error) {
    res.status(404).json({ error: (error as unknown as Error).message });
  }
}

export async function createPlan(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const trainingPlanDtos = await trainingService.createTrainingPlan(userDAO, userClaimsSet, req.body);
    res.status(200).json({ trainingPlanDtos });
  } catch (error) {
    console.error('Es ist ein Fehler beim Erstellen des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function deletePlan(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    await trainingService.deleteTrainingPlan(userDAO, userClaimsSet, req.params.planId);
    res.status(201).json({ message: 'Trainingsplan erfolgreich gelöscht' });
  } catch (error) {
    console.error('Es ist ein Fehler beim Löschen des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function getPlanForEdit(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const trainingPlanEditView = await trainingService.getTrainingPlanForEdit(userDAO, userClaimsSet, req.params.id);
    res.status(200).json({ trainingPlanEditView });
  } catch (error) {
    console.error('Es ist ein Fehler beim Editieren des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function updatePlan(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    await trainingService.updateTrainingPlan(userDAO, userClaimsSet, req.params.id, req.body);
    res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Es ist ein Fehler beim Aktualisieren des Trainingsplans aufgetreten', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function getPlanForDay(req: Request, res: Response): Promise<void> {
  try {
    const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
    const userClaimsSet = res.locals.user;
    const { id, week, day } = req.params;
    const trainingPlanForDay = await trainingService.getTrainingPlanForDay(
      userDAO,
      userClaimsSet,
      id,
      Number(week),
      Number(day)
    );
    res.status(200).json(trainingPlanForDay);
  } catch (error) {
    console.log('Es ist ein Fehler beim Aufrufen des Trainingsplans aufgetreten!', error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function getLatestTrainingPlan(req: Request, res: Response) {
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
}

export async function getTrainingPlan(req: Request, res: Response) {
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
          updateExercise(fieldName, fieldValue, exerciseInLaterWeek, trainingDayInLaterWeek, exerciseIndex, true);
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
}
