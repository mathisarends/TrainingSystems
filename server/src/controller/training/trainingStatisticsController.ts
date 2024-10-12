import { Request, Response } from 'express';

import { AverageTrainingDayDurationDto } from '../../interfaces/averageTrainingDayDurationDto.js';
import { ChartDataDto } from '../../interfaces/chartDataDto.js';
import trainingPlanManager from '../../service/trainingPlanManager.js';
import { PerformanceProgressionManager } from '../../service/trainingStatistics/performance-progression-manager.js';
import { SessionDurationManager } from '../../service/trainingStatistics/session-duration-manager.js';
import { SetProgressionManager } from '../../service/trainingStatistics/set-progression-manager.js';
import { TonnageProgressionManager } from '../../service/trainingStatistics/tonnage-progression-manager.js';
import userManager from '../../service/userManager.js';

/**
 * Updates the list of recently viewed exercise categories for the statistics section of a specific training plan.
 */
export async function updateViewedCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);

  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  trainingPlan.recentlyViewedCategoriesInStatisticSection = exerciseCategories;

  await userManager.update(user);

  res.status(200).json('Kategorien geupdated');
}

/**
 * Retrieves the list of recently viewed exercise categories for the statistics section of a specific training plan.
 */
export async function getViewedCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;

  const user = await userManager.getUser(res);

  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  res.status(200).json(trainingPlan.recentlyViewedCategoriesInStatisticSection ?? ['Squat', 'Bench', 'Deadlift']);
}

/**
 * Retrieves the number of sets per week for the specified exercise categories in a specific training plan.
 */
export async function getSetsForCategories(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);

  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  const setProgressionManager = new SetProgressionManager(trainingPlan);
  const responseData = setProgressionManager.getSetProgressionByCategories(exerciseCategories);

  return res.status(200).json(responseData);
}

/**
 * Retrieves tonnage data for specific exercise categories in a specific training plan.
 */
export async function getTonnageForCategories(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);
  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  const tonnageProgressionManager = new TonnageProgressionManager(trainingPlan);

  const responseData = tonnageProgressionManager.getTonnageProgressionByCategories(exerciseCategories);
  return res.status(200).json(responseData);
}

/**
 * Retrieves tonnage data for specific exercise categories across multiple training plans.
 */
export async function getVolumeComparison(req: Request, res: Response): Promise<Response> {
  const trainingPlanTitles = (req.query.plans as string).split(',');
  const exerciseCategory = req.query.category as string;

  const user = await userManager.getUser(res);

  const responseData = await Promise.all(
    trainingPlanTitles.map(async title => {
      const trainingPlan = await trainingPlanManager.findTrainingPlanByTitle(user, title);
      const tonnageProgressionManager = new TonnageProgressionManager(trainingPlan);

      return {
        [title]: tonnageProgressionManager.getTonnageProgressionByCategories([exerciseCategory])
      };
    })
  );

  const responseObject = Object.assign({}, ...responseData);

  return res.status(200).json(responseObject);
}

export async function getPerformanceCharts(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);
  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  const performanceProgressionManager = new PerformanceProgressionManager(trainingPlan);
  const performanceData = performanceProgressionManager.getPerformanceProgressionByCategories(exerciseCategories);

  return res.status(200).json(performanceData);
}

/**
 * Retrieves performance data for specific exercise categories across multiple training plans.
 */
export async function getPerformanceComparisonCharts(req: Request, res: Response): Promise<Response> {
  const trainingPlanTitles = (req.query.plans as string).split(',');
  const exerciseCategory = req.query.category as string;

  const user = await userManager.getUser(res);

  const responseData = await Promise.all(
    trainingPlanTitles.map(async title => {
      const trainingPlan = await trainingPlanManager.findTrainingPlanByTitle(user, title);
      const performanceProgressionManager = new PerformanceProgressionManager(trainingPlan);

      return {
        [trainingPlan.title]: performanceProgressionManager.getPerformanceProgressionByCategories([exerciseCategory])
      };
    })
  );

  const responseObject = Object.assign({}, ...responseData);

  return res.status(200).json(responseObject);
}

export async function getAverageSessionDurationDataForTrainingPlanDay(
  req: Request,
  res: Response
): Promise<Response<AverageTrainingDayDurationDto[]>> {
  const trainingPlanId = req.params.id;

  const user = await userManager.getUser(res);
  const trainingPlan = await trainingPlanManager.findTrainingPlanById(user, trainingPlanId);

  const sessionDurationManager = new SessionDurationManager(trainingPlan);

  const averageDurationsByDayOfWeek = sessionDurationManager.calculateAverageDurations();

  return res.status(200).json(averageDurationsByDayOfWeek);
}
