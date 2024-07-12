import express from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';

import { authService } from '../service/authService.js';
import { TrainingPlanDTO } from '../dto/trainingDto.js';

import { v4 as uuidv4 } from 'uuid';

import dotenv from 'dotenv';
import { TrainingPlan } from '@shared/models/training/trainingPlan.js';
import { TrainingWeek } from '@shared/models/training/trainingWeek.js';
import { TrainingDay } from '@shared/models/training/trainingDay.js';
import { User } from '@shared/models/user.js';
import { BasicTrainingPlanView } from '@shared/models/dtos/training/trainingDto.types.js';
dotenv.config();

const router = express.Router();

// Darstellung auf der Trainings index page
router.get('/plans', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  const trainingPlanDtos = getAllPlansBasic(user.trainingPlans);

  res.status(200).json({ trainingPlanDtos });
});

router.post('/create', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const userClaimsSet = res.locals.user;

  try {
    const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const title = req.body.title;
    const trainingFrequency = req.body.trainingFrequency;
    const trainingPlanWeeks = req.body.trainingWeeks;
    const weightRecommandation = req.body.weightPlaceholders;

    const trainingWeeks = createNewTrainingPlanWithPlaceholders(Number(trainingPlanWeeks), Number(trainingFrequency));

    const newTrainingPlan: TrainingPlan = {
      id: uuidv4(),
      title: title,
      trainingFrequency: trainingFrequency,
      weightRecommandationBase: weightRecommandation,
      lastUpdated: new Date(),
      trainingWeeks: trainingWeeks
    };

    user.trainingPlans.push(newTrainingPlan);
    await userDAO.update(user);

    console.log('Der Plan wurde erfolgreich erstellt');

    const trainingPlanDtos = getAllPlansBasic(user.trainingPlans);

    res.status(200).json({ trainingPlanDtos });
  } catch (error) {
    console.error('Es ist ein Fehler beim erstellen des Trainingplans aufgetreten', error);
    res.status(500).json({ error: error });
  }
});

router.delete('/delete/:index', authService.authenticationMiddleware, async (req, res) => {
  const trainingPlanIndex = Number(req.params.index);
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const userClaimsSet = res.locals.user;

  try {
    const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    if (trainingPlanIndex < 0 || trainingPlanIndex >= user.trainingPlans.length) {
      return res.status(400).json({ error: 'Ungültiger Trainingsplanindex' });
    }

    user.trainingPlans.splice(trainingPlanIndex, 1);

    await userDAO.update(user);
    res.status(201).json({ message: 'Trainingsplan erfolgreich gelöscht' });
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Löschen des Trainingsplans aufgetreten ' + error;
    console.error(errMessage);
    res.status(500).json({ error: 'Es ist ein Fehler beim Löschen des Trainingsplans aufgetreten' });
  }
});

router.get('/edit/:index', authService.authenticationMiddleware, async (req, res) => {
  const trainingPlanIndex = Number(req.params.index);
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const userClaimsSet = res.locals.user;

  try {
    const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
    console.log('🚀 ~ router.get ~ user:', user);
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const trainingPlan = user.trainingPlans[trainingPlanIndex];

    const fields: Array<keyof TrainingPlan> = [
      'id',
      'title',
      'trainingFrequency',
      'weightRecommandationBase',
      'trainingWeeks'
    ];

    const trainingPlanEditView = TrainingPlanDTO.getCustomView(trainingPlan, fields);
    console.log('🚀 ~ router.get ~ trainingPlanEditView:', trainingPlanEditView);

    res.status(200).json({ trainingPlanEditView });
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Editieren des Trainingsplans aufgetreten ' + error;
    console.error(errMessage);
    res.status(500).json({ error: 'Es ist ein Fehler beim Löschen des Trainingsplans aufgetreten' });
  }
});

router.patch('/edit/:index', authService.authenticationMiddleware, async (req, res) => {
  const trainingPlanIndex = Number(req.params.index);
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const userClaimsSet = res.locals.user;

  try {
    const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const trainingPlan = user.trainingPlans[trainingPlanIndex];

    trainingPlan.title = req.body.title;
    trainingPlan.trainingFrequency = req.body.trainingFrequency;
    trainingPlan.weightRecommandationBase = req.body.weightPlaceholders;

    if (trainingPlan.trainingWeeks.length !== req.body.trainingWeeks) {
      const difference = trainingPlan.trainingWeeks.length - parseInt(req.body.trainingWeeks);

      handleWeekDifference(trainingPlan, difference);
    }

    await userDAO.update(user);
    res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert' });
  } catch (error) {
    const errMessage = 'Es ist ein Fehler beim Editieren des Trainingsplans aufgetreten ' + error;
    console.error(errMessage);
    res.status(500).json({ error: 'Es ist ein Fehler beim Löschen des Trainingsplans aufgetreten' });
  }
});

function getAllPlansBasic(trainingPlans: TrainingPlan[]): BasicTrainingPlanView[] {
  const trainingPlanDtos: BasicTrainingPlanView[] = [];

  for (const trainingPlan of trainingPlans) {
    trainingPlanDtos.push(TrainingPlanDTO.getBasicView(trainingPlan));
  }

  return trainingPlanDtos;
}

function createNewTrainingPlanWithPlaceholders(weeks: number, daysPerWeek: number): TrainingWeek[] {
  const trainingWeeks: TrainingWeek[] = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const trainingDays: TrainingDay[] = [];
    for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex++) {
      const trainingDay: TrainingDay = {
        exercises: []
      };
      trainingDays.push(trainingDay);
    }
    trainingWeeks.push({ trainingDays });
  }

  return trainingWeeks;
}

function handleWeekDifference(trainingPlan: TrainingPlan, difference: number) {
  const absoluteDifference = Math.abs(difference);

  if (difference < 0) {
    addNewTrainingWeeks(trainingPlan.trainingWeeks, trainingPlan.trainingFrequency, absoluteDifference);
  } else {
    removeTrainingWeeks(trainingPlan.trainingWeeks, absoluteDifference);
  }
}

function addNewTrainingWeeks(trainingWeeks: TrainingWeek[], trainingFrequency: number, addedWeeks: number) {
  const emptyTrainingDay = {
    exercises: []
  };

  for (let j = 0; j < addedWeeks; j++) {
    const trainingDays = [];
    for (let i = 0; i < trainingFrequency; i++) {
      trainingDays.push(emptyTrainingDay);
    }
    trainingWeeks.push({ trainingDays });
  }
}

export function removeTrainingWeeks(trainingWeeks: TrainingWeek[], removeTrainingWeeks: number) {
  for (let i = 0; i < removeTrainingWeeks; i++) {
    trainingWeeks.pop();
  }
}

export default router;
