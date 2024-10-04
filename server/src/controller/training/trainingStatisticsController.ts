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
import { SetProgressionManager } from '../../service/set-progression-manager.js';
import trainingPlanManager from '../../service/trainingPlanManager.js';
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
export async function getTonnageForCategories(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const user = await userManager.getUser(res);
  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const responseData: LineChartDataDTO = {};

  // Add tonnage data for each exercise category
  exerciseCategories.forEach(category => {
    const exerciseCategory = mapToExerciseCategory(category);
    if (exerciseCategory) {
      responseData[capitalize(category)] = prepareTrainingWeeksForExercise(trainingPlan, exerciseCategory);
    }
  });

  res.status(200).json(responseData);
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
      { dayOfWeek: 'Monday', averageDuration: 60 },
      { dayOfWeek: 'Tuesday', averageDuration: 55 },
      { dayOfWeek: 'Wednesday', averageDuration: 70 },
      { dayOfWeek: 'Thursday', averageDuration: 40 },
      { dayOfWeek: 'Friday', averageDuration: 50 },
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
export async function getVolumeComparison(req: Request, res: Response): Promise<void> {
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
    const planData: LineChartDataDTO = {};

    const mappedExerciseCategory = mapToExerciseCategory(exerciseCategory);
    if (mappedExerciseCategory) {
      planData[capitalize(exerciseCategory)] = prepareTrainingWeeksForExercise(trainingPlan, mappedExerciseCategory);
    }

    responseData[trainingPlan.title] = planData;
  }

  res.status(200).json(responseData);
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

export async function getPerformanceCharts(req: Request, res: Response): Promise<void> {
  const trainingPlanId = req.params.id;
  const exerciseCategories = (req.query.exercises as string).split(',');

  const mappedExerciseCategories = exerciseCategories.map((category: string) => mapToExerciseCategory(category));

  const mainExercises = [
    ExerciseCategoryType.SQUAT,
    ExerciseCategoryType.BENCH,
    ExerciseCategoryType.DEADLIFT,
    ExerciseCategoryType.OVERHEADPRESS
  ];

  const validExercises = mappedExerciseCategories.filter(exercise => mainExercises.includes(exercise));

  const user = await userManager.getUser(res);
  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, trainingPlanId);

  const performanceData = validExercises.reduce((result, category) => {
    result[capitalize(category)] = getBestPerformanceByExercise(trainingPlan, category);
    return result;
  }, {} as LineChartDataDTO);

  res.status(200).json(performanceData);
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

/**
 * Calculates the number of sets per week for a specific exercise category in a training plan.
 */
function getSetsPerWeek(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategoryType): number[] {
  return trainingPlan.trainingWeeks.map(week => {
    let sets = 0;

    week.trainingDays.forEach(trainingDay => {
      trainingDay.exercises.forEach(exercise => {
        if (exercise.category === exerciseCategory) {
          sets += exercise.sets;
        }
      });
    });

    return sets;
  });
}

/**
 * Prepares tonnage data for a specific exercise category over the training weeks in a training plan.
 */
function prepareTrainingWeeksForExercise(trainingPlan: TrainingPlan, exerciseCategory: ExerciseCategoryType): number[] {
  return trainingPlan.trainingWeeks
    .map((week, index) => {
      let tonnageInCategory = 0;

      week.trainingDays.forEach(trainingDay => {
        trainingDay.exercises.forEach((exercise: Exercise) => {
          if (exercise.category === exerciseCategory) {
            const weight = parseFloat(exercise.weight) || 0;
            tonnageInCategory += exercise.sets * exercise.reps * weight;
          }
        });
      });

      return {
        tonnageInCategory,
        index
      };
    })
    .filter(weekData => weekData.tonnageInCategory > 0 || weekData.index === 0 || weekData.index === 1) // Include first and second weeks even if tonnage is 0
    .map(weekData => weekData.tonnageInCategory);
}
