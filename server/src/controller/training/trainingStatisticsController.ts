import { Request, Response } from 'express';

import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';
import { Exercise } from '../../models/training/exercise.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import * as trainingService from '../../service/trainingService.js';
import { mapToExerciseCategory } from '../../utils/exerciseUtils.js';

import _ from 'lodash';
import { ValidationError } from '../../errors/validationError.js';
import { AverageTrainingDayDurationDto } from '../../interfaces/averageTrainingDayDurationDto.js';
import { ChartDataDto } from '../../interfaces/chartDataDto.js';
import { LineChartDataDTO } from '../../interfaces/lineChartDataDto.js';
import trainingPlanManager from '../../service/trainingPlanManager.js';
import { PerformanceProgressionManager } from '../../service/trainingStatistics/performance-progression-manager.js';
import { SetProgressionManager } from '../../service/trainingStatistics/set-progression-manager.js';
import { TonnageProgressionManager } from '../../service/trainingStatistics/tonnage-progression-manager.js';
import userManager from '../../service/userManager.js';
const { capitalize } = _;

/**
 * Updates the list of recently viewed exercise categories for the statistics section of a specific training plan.
 */
export async function updateViewedCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

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

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  res.status(200).json(trainingPlan.recentlyViewedCategoriesInStatisticSection ?? ['Squat', 'Bench', 'Deadlift']);
}

/**
 * Retrieves the number of sets per week for the specified exercise categories in a specific training plan.
 */
export async function getSetsForCategories(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

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
  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const tonnageProgressionManager = new TonnageProgressionManager(trainingPlan);

  const responseData = tonnageProgressionManager.getTonnageProgressionByCategories(exerciseCategories);
  return res.status(200).json(responseData);
}

export async function getAverageSessionDurationDataForTrainingPlanDay(req: Request, res: Response): Promise<Response> {
  const trainingPlanId = req.params.id;

  const user = await userManager.getUser(res);
  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const trainingDaysWithDuration = trainingPlan.trainingWeeks
    .flatMap(week => week.trainingDays)
    .filter(day => !!day.durationInMinutes)
    .map(day => ({
      durationInMinutes: day.durationInMinutes!,
      date: new Date(day.endTime!)
    }));

  const dayOfWeekDurations: Record<number, { totalDuration: number; count: number }> = {
    0: { totalDuration: 0, count: 0 }, // Sunday
    1: { totalDuration: 0, count: 0 }, // Monday
    2: { totalDuration: 0, count: 0 }, // Tuesday
    3: { totalDuration: 0, count: 0 }, // Wednesday
    4: { totalDuration: 0, count: 0 }, // Thursday
    5: { totalDuration: 0, count: 0 }, // Friday
    6: { totalDuration: 0, count: 0 } // Saturday
  };

  trainingDaysWithDuration.forEach(trainingDay => {
    const dayOfWeek = trainingDay.date.getDay();
    dayOfWeekDurations[dayOfWeek].totalDuration += trainingDay.durationInMinutes;
    dayOfWeekDurations[dayOfWeek].count += 1;
  });

  const daysOfWeekLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  const averageDurationsByDayOfWeek: AverageTrainingDayDurationDto[] = Object.entries(dayOfWeekDurations)
    .filter(([, dayData]) => dayData.count > 0) // Filter out days with no training (count === 0)
    .map(([dayIndex, dayData]) => {
      const averageDuration = dayData.totalDuration / dayData.count;
      return {
        dayOfWeek: daysOfWeekLabels[Number(dayIndex)],
        averageDuration: averageDuration
      };
    });

  if (process.env.NODE_ENV === 'development') {
    const mockAverageDurationsByDayOfWeek: AverageTrainingDayDurationDto[] = [
      { dayOfWeek: 'Sunday', averageDuration: 45 },
      { dayOfWeek: 'Tuesday', averageDuration: 55 },
      { dayOfWeek: 'Thursday', averageDuration: 40 },
      { dayOfWeek: 'Saturday', averageDuration: 65 }
    ];
    return res.status(200).json(mockAverageDurationsByDayOfWeek);
  }

  return res.status(200).json(averageDurationsByDayOfWeek);
}

// TODO: Momentan noch mit Title aber mit id die pläne wäre hier semantisch richtiger
/**
 * Retrieves tonnage data for specific exercise categories across multiple training plans.
 */
export async function getVolumeComparison(req: Request, res: Response): Promise<Response> {
  const trainingPlanTitles = (req.query.plans as string).split(',');
  const exerciseCategory = req.query.category as string;

  const user = await userManager.getUser(res);

  const trainingPlans: TrainingPlan[] = await Promise.all(
    trainingPlanTitles.map(async title => {
      return await trainingPlanManager.findTrainingPlanByTitle(user, title);
    })
  );

  const responseData: Record<string, LineChartDataDTO> = {};

  for (const trainingPlan of trainingPlans) {
    const tonnageProgressionManager = new TonnageProgressionManager(trainingPlan);
    const planData = tonnageProgressionManager.getTonnageProgressionByCategories([exerciseCategory]);

    responseData[trainingPlan.title] = planData;
  }

  return res.status(200).json(responseData);
}

/**
 * Retrieves performance data for specific exercise categories across multiple training plans.
 */
export async function getPerformanceComparisonCharts(req: Request, res: Response): Promise<void> {
  const trainingPlanTitles = (req.query.plans as string).split(',');
  const exerciseCategory = req.query.category as string;

  const mappedExerciseCategory = mapToExerciseCategory(exerciseCategory);

  const mainExercises = [
    ExerciseCategoryType.SQUAT,
    ExerciseCategoryType.BENCH,
    ExerciseCategoryType.DEADLIFT,
    ExerciseCategoryType.OVERHEADPRESS
  ];

  if (!mainExercises.includes(mappedExerciseCategory)) {
    throw new ValidationError('Ungültige Kategorie');
  }

  const user = await userManager.getUser(res);

  const trainingPlans: TrainingPlan[] = await Promise.all(
    trainingPlanTitles.map(async title => {
      return await trainingPlanManager.findTrainingPlanByTitle(user, title);
    })
  );

  const responseData: Record<string, LineChartDataDTO> = {};

  for (const trainingPlan of trainingPlans) {
    const planData: LineChartDataDTO = {};

    planData[capitalize(exerciseCategory)] = getBestPerformanceByExercise(trainingPlan, mappedExerciseCategory);

    responseData[trainingPlan.title] = planData;
  }

  res.status(200).json(responseData);
}

export async function getPerformanceCharts(req: Request, res: Response): Promise<Response<ChartDataDto>> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);
  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const performanceProgressionManager = new PerformanceProgressionManager(trainingPlan);
  const performanceData = performanceProgressionManager.getPerformanceProgressionByCategories(exerciseCategories);

  return res.status(200).json(performanceData);
}

function getBestPerformanceByExercise(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategoryType): number[] {
  return trainingPlan.trainingWeeks
    .map((week, index) => {
      let bestPerformance = 0;

      week.trainingDays.forEach(trainingDay => {
        trainingDay.exercises.forEach((exercise: Exercise) => {
          if (exercise.category === exerciseCategory && exercise.estMax) {
            bestPerformance = Math.max(bestPerformance, exercise.estMax);
          }
        });
      });

      return {
        bestPerformance,
        isInitialWeek: index === 0 || index === 1
      };
    })
    .filter(weekData => weekData.bestPerformance > 0 || weekData.isInitialWeek)
    .map(weekData => weekData.bestPerformance); // Now return only the number
}
