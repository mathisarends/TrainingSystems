import { Request, Response } from 'express';
import { TrainingRoutineStatisticsManager } from '../../service/trainingRoutine/trainingRoutineStatisticsManager';
import trainingSessionService from '../../service/trainingSessionService';
import userManager from '../../service/userManager.js';

/**
 * Retrieves the list of recently viewed exercise categories for the statistics section of a specific training plan.
 */
export async function getExercisesFromTrainingSession(req: Request, res: Response): Promise<Response<string[]>> {
  const trainingSessionId = req.params.id;

  const user = await userManager.getUser(res);
  const trainingSession = await trainingSessionService.findByUserIdAndSessionId(user.id, trainingSessionId);

  const trainingRoutineStatisticsManager = new TrainingRoutineStatisticsManager(trainingSession);
  const commonExercisesForAllSessions = trainingRoutineStatisticsManager.getCommonExercisesForAllSessions();

  return res.status(200).json(commonExercisesForAllSessions);
}
