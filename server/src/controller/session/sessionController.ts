import { Request, Response } from 'express';

import { v4 as uuidv4 } from 'uuid';
import { TrainingSessionCardDto } from '../../models/dto/training-session-card-dto.js';
import { TrainingSession } from '../../models/training/training-session.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import * as userService from '../../service/userService.js';
import { TrainingSessionMetaDataDto } from './trainingSessionMetaDataDto.js';

import _ from 'lodash';
import { ApiData } from '../../models/apiData.js';
import { Exercise } from '../../models/training/exercise.js';
import { createExerciseObject, updateExercise } from '../../service/trainingService.js';

/**
 * Retrieves a specific training session by its ID.
 */
export async function getTrainingSessionById(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;

  const user = await userService.getUser(req, res);

  const trainingSession = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!trainingSession) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  const mappedTrainingSession: TrainingSession = {
    id: trainingSession.id,
    title: trainingSession.title,
    lastUpdated: trainingSession.lastUpdated,
    weightRecommandationBase: trainingSession.weightRecommandationBase,
    versions: trainingSession.versions,
    coverImageBase64: trainingSession.coverImageBase64 ?? ''
  };

  return res.status(200).json(mappedTrainingSession);
}

/**
 * Retrieves a summarized view of all training sessions in a card format.
 */
export async function getTrainingSessionCardViews(req: Request, res: Response): Promise<Response> {
  const user = await userService.getUser(req, res);

  const trainingSessions: TrainingSessionCardDto[] = user.trainingSessions.map(trainingSession => {
    return {
      id: trainingSession.id,
      title: trainingSession.title,
      lastUpdated: trainingSession.lastUpdated,
      coverImageBase64: trainingSession.coverImageBase64 ?? '',
      pictureUrl: user.pictureUrl
    };
  });

  return res.status(200).json(trainingSessions);
}

/**
 * Creates a new training session for the user.
 */
export async function createTrainingSession(req: Request, res: Response): Promise<Response> {
  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  const trainingSessionCreateDto = req.body as TrainingSessionMetaDataDto;

  if (!user.trainingSessions) {
    user.trainingSessions = [];
  }

  const newTrainingSession: TrainingSession = {
    id: uuidv4(),
    title: trainingSessionCreateDto.title,
    lastUpdated: new Date(),
    weightRecommandationBase: trainingSessionCreateDto.weightRecommandationBase,
    coverImageBase64: trainingSessionCreateDto.coverImageBase64 ?? '',
    versions: []
  };

  createPlaceholderVersion(newTrainingSession);

  user.trainingSessions.unshift(newTrainingSession);

  await userDAO.update(user);
  console.log('user sessions', user.trainingSessions);

  return res.status(200).json({ message: 'Erfolgreich erstellt ' });
}

function createPlaceholderVersion(trainingSession: TrainingSession): void {
  trainingSession.versions.push({
    id: uuidv4(),
    exercises: []
  });
}

/**
 * Edits an existing training session by its ID.
 */
export async function editTrainingSesssion(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;
  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  const trainingSessionEditDto = req.body as TrainingSessionMetaDataDto;

  const plan = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!plan) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  plan.title = trainingSessionEditDto.title;
  plan.lastUpdated = new Date();
  plan.weightRecommandationBase = trainingSessionEditDto.weightRecommandationBase;
  plan.coverImageBase64 = trainingSessionEditDto.coverImageBase64;

  await userDAO.update(user);

  return res.status(200).json({ message: 'Änderungen gespeichert' });
}

/**
 * Deletes a specific training session by its ID.
 */
export async function deleteTrainingSession(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;
  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  const sessionIndex = user.trainingSessions.findIndex(session => session.id === trainingSessionId);

  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  user.trainingSessions.splice(sessionIndex, 1);

  await userDAO.update(user);

  return res.status(200).json({ message: 'Training Session erfolgreich gelöscht' });
}

/**
 * Starts a new training session based on the most recent one.
 */
export async function startTrainingSession(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;

  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  const trainingSession = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!trainingSession) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  // Erste Session neu erstellen
  if (trainingSession.versions.length === 0) {
    return res.status(200).json({ trainingSessionTemplate: undefined, version: 1 });
  }

  const trainingSessionTemplate = prepareTrainingSessionTemplate(trainingSession);
  trainingSession.versions.push(trainingSessionTemplate);

  await userDAO.update(user);

  return res.status(200).json({ trainingSessionTemplate, version: trainingSession.versions.length });
}

/**
 * Prepares a new training session template based on the most recent session.
 *
 * - Copies the most recent training day and resets fields like `estMax`, `notes`, `weight`, and `actualRPE` for each exercise.
 */
function prepareTrainingSessionTemplate(trainingSession: TrainingSession): TrainingDay {
  const mostRecentSession = trainingSession.versions[0];
  const deepCopyOfMostRecentSession = _.cloneDeep(mostRecentSession);

  for (const exericse of deepCopyOfMostRecentSession.exercises) {
    exericse.estMax = undefined;
    exericse.notes = undefined;
    exericse.weight = '';
    exericse.actualRPE = '';
  }

  return deepCopyOfMostRecentSession;
}

/**
 * Retrieves a specific version of a training session by its ID and version number.
 *
 * @description
 * - Retrieves a specific version of a training session using its ID and version number.
 * - Returns 404 errors if the session or the version is not found.
 */
export async function getTrainingSessionByVersion(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;
  const version = Number(req.params.version);

  if (isNaN(version)) {
    return res.status(404).json({ error: 'Ungülitger Wert für die Version' });
  }

  const user = await userService.getUser(req, res);

  const trainingSession = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!trainingSession) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  if (!trainingSession.versions[version - 1]) {
    return res.status(404).json({ error: 'Version der Session nicht gefunden' });
  }

  return res.status(200).json(trainingSession.versions[version - 1]);
}

export async function getLatestVersionOfSession(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;

  const user = await userService.getUser(req, res);

  const trainingSession = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!trainingSession) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  const latestVersion = trainingSession.versions.length;

  return res.status(200).json(latestVersion);
}

export async function updateTrainingSessionVersion(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;
  const version = Number(req.params.version);

  if (isNaN(version)) {
    return res.status(404).json({ error: 'Ungülitger Wert für die Version' });
  }

  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  const trainingSession = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!trainingSession) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  const trainingSessionVersion = trainingSession.versions[version - 1];

  if (!trainingSessionVersion) {
    return res.status(404).json({ error: 'Version der Session nicht gefunden' });
  }

  const changedData: ApiData = req.body;

  updateExercisesInSessionVersion(trainingSessionVersion, changedData);

  await userDAO.update(user);
  console.log('🚀 ~ updateTrainingSessionVersion ~ trainingSession:', trainingSession);

  return res.status(200).json({ message: 'Änderungen gespeichert ' });
}

function updateExercisesInSessionVersion(session: TrainingDay, changedData: ApiData) {
  let deleteLogicHappend = false;

  for (const [fieldName, fieldValue] of Object.entries(changedData)) {
    const exerciseIndex = parseInt(fieldName.charAt(17)) - 1;

    const exercise = session.exercises[exerciseIndex];

    if (!exercise && fieldName.endsWith('category')) {
      const newExercise = createExerciseObject(fieldName, fieldValue) as Exercise;
      session.exercises.push(newExercise);
    }

    if (isDeletedExercise(exercise, fieldName, fieldValue)) {
      let exerciseIndex = session.exercises.findIndex(ex => ex === exercise);

      // Shift exercises one position up
      while (exerciseIndex < session.exercises.length - 1) {
        session.exercises[exerciseIndex] = session.exercises[exerciseIndex + 1];

        exerciseIndex++;
      }
      session.exercises.pop();
      deleteLogicHappend = true;
    }

    if (exercise && !deleteLogicHappend) {
      updateExercise(fieldName, fieldValue, exercise, session, exerciseIndex + 1);
    }
  }

  function isDeletedExercise(exercise: Exercise, fieldName: string, fieldValue: string) {
    return exercise && fieldName.endsWith('category') && !fieldValue;
  }
}
