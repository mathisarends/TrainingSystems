import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../models/collections/user/user.js';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import { TrainingPlanCardViewDto } from '../../models/dto/training-plan-card-view-dto.js';
import { ExerciseCategoryType } from '../../models/training/exercise-category-type.js';
import { TrainingPlan } from '../../models/training/trainingPlan.js';
import { WeightRecommendationBase } from '../../models/training/weight-recommandation.enum.js';
import { TrainingPlanDtoMapper } from '../../service/training-plan-dto-mapper.js';
import * as trainingService from '../../service/trainingService.js';
import {
  createNewTrainingPlanWithPlaceholders,
  findTrainingPlanById,
  handleWeekDifference
} from '../../service/trainingService.js';
import { getUser, getUserGenericDAO } from '../../service/userService.js';

import _ from 'lodash';
import { TrainingDAyFinishedNotification } from '../../models/collections/user/training-fninished-notifcation.js';
import { TrainingPlanEditViewDto } from '../../models/dto/training-plan-edit-view-dto.js';

import transporter from '../../config/mailerConfig.js';

/**
 * Retrieves the list of training plans for the user, summarizing them into card views.
 * The result is intended to be a lightweight representation of the user's training plans.
 */
export async function getPlans(req: Request, res: Response): Promise<void> {
  const user = await getUser(req, res);

  const trainingPlanCards: TrainingPlanCardViewDto[] = user.trainingPlans.map((plan: TrainingPlan) => ({
    ...TrainingPlanDtoMapper.getCardView(plan),
    pictureUrl: user.pictureUrl,
    percentageFinished: trainingService.getPercentageOfTrainingPlanFinished(plan),
    averageTrainingDayDuration: trainingService.getAverageTrainingDuration(plan)
  }));

  res.status(200).json(trainingPlanCards);
}

export async function updateTrainingPlanOrder(req: Request, res: Response): Promise<Response> {
  const user = await getUser(req, res);
  const userDAO = getUserGenericDAO(req);

  const { updatedOrder } = req.body;

  if (!Array.isArray(updatedOrder)) {
    return res.status(400).json({ error: 'Invalid request body. Expected an array of training plan IDs.' });
  }

  const sortedTrainingPlans = updatedOrder.map((id: string) => {
    const plan = user.trainingPlans.find((p: TrainingPlan) => p.id === id);
    if (!plan) {
      throw new Error(`Training plan with ID ${id} not found`);
    }
    return plan;
  });

  user.trainingPlans = sortedTrainingPlans;

  await userDAO.update(user);

  return res.status(200).json({ message: 'Reihenfolge geupdated' });
}

/**
 * Creates a new training plan for the user with the specified parameters.
 * This plan includes placeholders for exercises based on the provided frequency and number of weeks.
 */
export async function createPlan(req: Request, res: Response): Promise<void> {
  const user = await getUser(req, res);
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const trainingPlanEditDto = req.body as TrainingPlanEditViewDto;

  const title = trainingPlanEditDto.title;
  const trainingFrequency = Number(trainingPlanEditDto.trainingFrequency);
  const trainingWeeks = Number(trainingPlanEditDto.trainingBlockLength);
  const weightRecommandation = trainingPlanEditDto.weightRecommandationBase as WeightRecommendationBase;
  const coverImage = trainingPlanEditDto.coverImageBase64;

  const referencePlanId = req.body.referencePlanId;
  let trainingWeeksArr;
  if (referencePlanId) {
    const trainingPlan = _.cloneDeep(findTrainingPlanById(user.trainingPlans, referencePlanId));

    trainingWeeksArr = trainingService.createNewTrainingPlanBasedOnTemplate(trainingPlan);
  } else {
    trainingWeeksArr = createNewTrainingPlanWithPlaceholders(trainingWeeks, trainingFrequency);
  }

  const newTrainingPlan: TrainingPlan = {
    id: uuidv4(),
    title,
    trainingFrequency,
    weightRecommandationBase: weightRecommandation,
    lastUpdated: new Date(),
    trainingWeeks: trainingWeeksArr,
    coverImageBase64: coverImage
  };

  user.trainingPlans.unshift(newTrainingPlan);
  await userDAO.update(user);

  res.status(200).json({ message: 'Plan erfolgreich erstellt' });
}

/**
 * Deletes a training plan from the user's list of training plans based on the provided plan ID.
 * This method ensures that the specified plan is removed from the user's data in the database.
 */
export async function deletePlan(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const planId = req.params.planId;

  const user = await getUser(req, res);
  const trainingPlanIndex = trainingService.findTrainingPlanIndexById(user.trainingPlans, planId);

  user.trainingPlans.splice(trainingPlanIndex, 1);
  await userDAO.update(user);

  res.status(201).json({ message: 'Trainingsplan erfolgreich gelöscht' });
}

/**
 * Retrieves a training plan for editing purposes. This method returns the plan in a format
 * that is suitable for client-side editing, typically including all details needed for modification.
 */
export async function getPlanForEdit(req: Request, res: Response): Promise<void> {
  const planId = req.params.id;

  const user = await getUser(req, res);

  const trainingPlan = trainingService.findTrainingPlanById(user.trainingPlans, planId);

  const trainingPlanEditView = TrainingPlanDtoMapper.getEditView(trainingPlan);

  res.status(200).json(trainingPlanEditView);
}

/**
 * Updates an existing training plan based on user input. Adjustments can include changes
 * to the plan's title, frequency, and week structure. It also handles differences in the
 * number of weeks by either adding or removing weeks from the plan.
 */
export async function updatePlan(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const planId = req.params.id;

  const user = await getUser(req, res);

  const trainingPlan = findTrainingPlanById(user.trainingPlans, planId);

  const trainingPlanEditDto = req.body as TrainingPlanEditViewDto;

  trainingPlan.title = trainingPlanEditDto.title;
  trainingPlan.trainingFrequency = Number(trainingPlanEditDto.trainingFrequency);
  trainingPlan.weightRecommandationBase = trainingPlanEditDto.weightRecommandationBase;

  if (trainingPlanEditDto.coverImageBase64) {
    trainingPlan.coverImageBase64 = trainingPlanEditDto.coverImageBase64;
  }

  if (trainingPlan.trainingWeeks.length !== trainingPlanEditDto.trainingBlockLength) {
    const difference = trainingPlan.trainingWeeks.length - trainingPlanEditDto.trainingBlockLength;
    handleWeekDifference(trainingPlan, difference);
  }

  const trainingData: TrainingDAyFinishedNotification = {
    id: '1234',
    endTime: new Date(),
    durationInMinutes: 90,
    trainingDayTonnage: 24000,
    exercises: [
      {
        exercise: 'Squat',
        category: 'Strength',
        sets: 4,
        reps: 8,
        weight: '100kg',
        targetRPE: '8',
        actualRPE: '7',
        estMax: 135
      },
      {
        exercise: 'Bench Press',
        category: 'Strength',
        sets: 3,
        reps: 10,
        weight: '75kg',
        targetRPE: '8',
        actualRPE: '7',
        estMax: 100
      },
      {
        exercise: 'Deadlift',
        category: 'Strength',
        sets: 3,
        reps: 6,
        weight: '120kg',
        targetRPE: '8',
        actualRPE: '7'
      }
    ]
  };

  const htmlContent = generateTrainingSummaryEmail(trainingData);

  await transporter.sendMail({
    from: 'trainingsystems@no-reply.com',
    to: user.email,
    subject: 'Your Training Summary',
    html: htmlContent
  });

  await userDAO.update(user);
  res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert' });
}

/**
 * Automatically progresses a training plan based on the user's input.
 * Handles deload phases and adjusts RPE for each exercise.
 */
export async function autoProgressionForTrainingPlan(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const planDeload = req.query.deloadWeek === 'true';
  const rpeIncrease = parseFloat(req.query.rpeProgression as string) || 0.5; // Default to 0.5 if not provided

  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const user = await getUser(req, res);

  const trainingPlan = findTrainingPlanById(user.trainingPlans, id);

  trainingPlan.trainingWeeks.forEach((trainingWeek, weekIndex) => {
    if (planDeload && isLastWeek(trainingPlan, weekIndex)) {
      handleDeloadWeek(trainingPlan, weekIndex);
    } else if (weekIndex !== 0) {
      adjustRPEForWeek(trainingPlan, weekIndex, rpeIncrease);
    }
  });

  await userDAO.update(user);

  res.status(200).json('Automatic Progression completed');
}

/**
 * Determines if the current week is the last week of the training plan.
 */
function isLastWeek(trainingPlan: TrainingPlan, weekIndex: number): boolean {
  return trainingPlan.trainingWeeks.length - 1 === weekIndex;
}

/**
 * Handles adjustments for a deload week by reducing sets and adjusting RPE.
 */
function handleDeloadWeek(trainingPlan: TrainingPlan, weekIndex: number): void {
  const lastTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];
  const deloadTrainingWeek = trainingPlan.trainingWeeks[weekIndex];

  deloadTrainingWeek.trainingDays.forEach((trainingDay, dayIndex) => {
    const trainingDayBeforeDeload = lastTrainingWeek.trainingDays[dayIndex];

    trainingDay.exercises.forEach((exercise, exerciseIndex) => {
      const exerciseBeforeDeload = trainingDayBeforeDeload.exercises[exerciseIndex];

      if (exercise.exercise === exerciseBeforeDeload.exercise) {
        exercise.sets = Math.max(exerciseBeforeDeload.sets - 1, 0);
        exercise.targetRPE = isMainCategory(exercise.category) ? '6' : '7';
      }
    });
  });
}

/**
 * Adjusts the RPE for each exercise for the given week, using the rpeIncrease parameter.
 */
function adjustRPEForWeek(trainingPlan: TrainingPlan, weekIndex: number, rpeIncrease: number): void {
  const previousTrainingWeek = trainingPlan.trainingWeeks[weekIndex - 1];

  trainingPlan.trainingWeeks[weekIndex].trainingDays.forEach((trainingDay, dayIndex) => {
    const previousWeekTrainingDay = previousTrainingWeek.trainingDays[dayIndex];

    trainingDay.exercises.forEach((exercise, exerciseIndex) => {
      const previousWeekExercise = previousWeekTrainingDay?.exercises[exerciseIndex];

      if (exercise.exercise === previousWeekExercise?.exercise) {
        if (isNumber(previousWeekExercise.targetRPE)) {
          const rpeMax = isMainCategory(exercise.category) ? 9 : 10;
          const parsedRPE = Number(previousWeekExercise.targetRPE);
          exercise.targetRPE = Math.min(parsedRPE + rpeIncrease, rpeMax).toString();
        } else {
          const rpeArray = parseStringToNumberArray(previousWeekExercise.targetRPE);

          if (rpeArray) {
            const rpeMax = isMainCategory(exercise.category) ? 9 : 10;
            const adjustedRpeArray = rpeArray.map(rpe => Math.min(rpe + rpeIncrease, rpeMax));
            exercise.targetRPE = adjustedRpeArray.join(';');
          } else {
            console.warn(`Cannot parse targetRPE for exercise: ${exercise.exercise}`);
          }
        }
      }
    });
  });
}

/**
 * Attempts to parse a string into an array of numbers if it can be split by a delimiter and parsed.

 */
function parseStringToNumberArray(value: string, delimiter: string = ';'): number[] | null {
  const parts = value.split(delimiter);
  const numbers = parts.map(part => Number(part.trim()));

  if (numbers.every(num => !isNaN(num))) {
    return numbers;
  }
  return null;
}

/**
 * Checks if a given value can be parsed as a number.
 */
function isNumber(value: string): boolean {
  const parsedNumber = Number(value);
  return !isNaN(parsedNumber);
}

/**
 * Checks if the exercise belongs to a main category (Squat, Bench, Deadlift).
 */
function isMainCategory(category: string): boolean {
  return (
    category === ExerciseCategoryType.SQUAT ||
    category === ExerciseCategoryType.BENCH ||
    category === ExerciseCategoryType.DEADLIFT
  );
}

function generateTrainingSummaryEmail(trainingData: TrainingDAyFinishedNotification) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Training Summary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
            padding: 20px;
          }

          .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          h1 {
            text-align: left;
            color: #2e3a40;
          }

          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .summary-table th, .summary-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }

          .summary-table th {
            background-color: #f0f0f0;
          }

          .text-center {
            text-align: center !important;
          }

          p {
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Training Summary</h1>
          <p>Date: <strong>${trainingData.endTime}</strong></p>
          <p>Total Duration: <strong>${trainingData.durationInMinutes}</strong> minutes</p>

          <table class="summary-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Category</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Weight</th>
                <th>Target RPE</th>
                <th>Actual RPE</th>
                <th>Est Max</th>
              </tr>
            </thead>
            <tbody>
              ${trainingData.exercises
                .map(
                  exercise => `
                <tr>
                  <td>${exercise.exercise}</td>
                  <td>${exercise.category}</td>
                  <td class="text-center">${exercise.sets}</td>
                  <td class="text-center">${exercise.reps}</td>
                  <td class="text-center">${exercise.weight}</td>
                  <td class="text-center">${exercise.targetRPE}</td>
                  <td class="text-center">${exercise.actualRPE}</td>
                 <td class="text-center">${exercise.estMax !== undefined && exercise.estMax !== null ? exercise.estMax : ''}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <p>Total Tonnage: <strong>${trainingData.trainingDayTonnage.toLocaleString()}</strong> kg</p>

        </div>
      </body>
    </html>
  `;
}
