import { Request, Response } from 'express';

import { TrainingSessionCardDto } from '../../models/dto/training-session-card-dto.js';
import * as userService from '../../service/userService.js';

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
