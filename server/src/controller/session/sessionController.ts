import { Request, Response } from 'express';

import { v4 as uuidv4 } from 'uuid';
import { TrainingSessionCardDto } from '../../models/dto/training-session-card-dto.js';
import { TrainingSession } from '../../models/training/training-session.js';
import { TrainingDay } from '../../models/training/trainingDay.js';
import * as userService from '../../service/userService.js';
import { TrainingPlanMetaDataDto } from './trainingSessionMetaDataDto.js';

import _ from 'lodash';

/**
 * Retrieves a specific training session by its ID.
 */
export async function getTrainingSessionById(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;

  const user = await userService.getUser(req, res);

  const plan = user.trainingSessions.find(session => session.id === trainingSessionId);

  return res.status(200).json(plan);
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

  const trainingSessionCreateDto = req.body as TrainingPlanMetaDataDto;

  const newTrainingSession: TrainingSession = {
    id: uuidv4(),
    title: trainingSessionCreateDto.title,
    lastUpdated: new Date(),
    weightRecommandationBase: trainingSessionCreateDto.weightRecommandationBase,
    coverImageBase64: trainingSessionCreateDto.coverImageBase64 ?? '',
    trainingDays: []
  };

  user.trainingSessions.unshift(newTrainingSession);

  await userDAO.update(user);

  return res.status(200).json({ message: 'Erfolgreich erstellt ' });
}

/**
 * Edits an existing training session by its ID.
 */
export async function editTrainingSesssion(req: Request, res: Response): Promise<Response> {
  const trainingSessionId = req.params.id;
  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  const trainingSessionEditDto = req.body as TrainingPlanMetaDataDto;

  const plan = user.trainingSessions.find(session => session.id === trainingSessionId);

  if (!plan) {
    return res.status(404).json({ error: 'Training Session nicht gefunden' });
  }

  plan.title = trainingSessionEditDto.title;
  plan.lastUpdated = new Date();
  plan.weightRecommandationBase = trainingSessionEditDto.weightRecommandationBase;
  plan.coverImageBase64 = trainingSessionEditDto.weightRecommandationBase;

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
  if (trainingSession.trainingDays.length === 0) {
    return res.status(200).json({ trainingSessionTemplate: undefined, version: 1 });
  }

  const trainingSessionTemplate = prepareTrainingSessionTemplate(trainingSession);
  trainingSession.trainingDays.push(trainingSessionTemplate);

  await userDAO.update(user);

  return res.status(200).json({ trainingSessionTemplate, version: trainingSession.trainingDays.length });
}

/**
 * Prepares a new training session template based on the most recent session.
 *
 * - Copies the most recent training day and resets fields like `estMax`, `notes`, `weight`, and `actualRPE` for each exercise.
 */
function prepareTrainingSessionTemplate(trainingSession: TrainingSession): TrainingDay {
  const mostRecentSession = trainingSession.trainingDays[0];
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

  if (!trainingSession.trainingDays[version - 1]) {
    return res.status(404).json({ error: 'Version der Session nicht gefunden' });
  }

  return res.status(200).json(trainingSession.trainingDays[version - 1]);
}

export async function updateTrainingSessionVersion(req: Request, res: Response): Promise<Response> {
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

  if (!trainingSession.trainingDays[version - 1]) {
    return res.status(404).json({ error: 'Version der Session nicht gefunden' });
  }

  return res.status(200);
}
