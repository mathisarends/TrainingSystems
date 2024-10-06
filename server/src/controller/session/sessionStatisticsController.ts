import { Request, Response } from 'express';
import { ChartDataDto } from '../../interfaces/chartDataDto.js';
import { TrainingRoutineStatisticsManager } from '../../service/trainingRoutine/trainingRoutineStatisticsManager.js';
import trainingSessionService from '../../service/trainingSessionService.js';
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

export async function getTonnageCharts(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingSessionId = req.params.id;
  const exerciseNames = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);
  const trainingSession = await trainingSessionService.findByUserIdAndSessionId(user.id, trainingSessionId);

  const trainingRoutineStatisticsManager = new TrainingRoutineStatisticsManager(trainingSession);
  const tonnageChartData = trainingRoutineStatisticsManager.getTonnageProgressionForExercises(exerciseNames);

  return res.status(200).json(tonnageChartData);
}

export async function getPerformanceCharts(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingSessionId = req.params.id;
  const exerciseNames = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);
  const trainingSession = await trainingSessionService.findByUserIdAndSessionId(user.id, trainingSessionId);

  const trainingRoutineStatisticsManager = new TrainingRoutineStatisticsManager(trainingSession);
  const performanceChartData =
    trainingRoutineStatisticsManager.getBestPerformanceProgressionForExercises(exerciseNames);

  return res.status(200).json(performanceChartData);
}
