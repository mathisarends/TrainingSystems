import { Request, Response } from 'express';
import { MongoGenericDAO } from '../../models/dao/mongo-generic.dao.js';
import * as trainingService from '../../service/trainingService.js';
import { User } from '../../models/collections/user/user.js';
import {
  createNewTrainingPlanWithPlaceholders,
  findTrainingPlanById,
  handleWeekDifference
} from '../../service/trainingService.js';
import { getUser } from '../../service/userService.js';
import { TrainingPlanDtoMapper } from '../../service/training-plan-dto-mapper.js';
import { TrainingPlanCardViewDto } from '../../models/dto/training-plan-card-view-dto.js';
import { WeightRecommendationBase } from '../../models/training/weight-recommandation.enum.js';
import { v4 as uuidv4 } from 'uuid';
import { TrainingPlan } from '../../models/training/trainingPlan.js';

/**
 * Retrieves the list of training plans for the user, summarizing them into card views.
 * The result is intended to be a lightweight representation of the user's training plans.
 */
export async function getPlans(req: Request, res: Response): Promise<void> {
  const user = await getUser(req, res);
  const trainingPlanCards: TrainingPlanCardViewDto[] = user.trainingPlans.map((plan: TrainingPlan) => ({
    ...TrainingPlanDtoMapper.getCardView(plan),
    pictureUrl: user.pictureUrl
  }));

  res.status(200).json({ trainingPlanCards });
}

/**
 * Creates a new training plan for the user with the specified parameters.
 * This plan includes placeholders for exercises based on the provided frequency and number of weeks.
 */
export async function createPlan(req: Request, res: Response): Promise<void> {
  const user = await getUser(req, res);
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  const title = req.body.title;
  const trainingFrequency = Number(req.body.trainingFrequency);
  const trainingWeeks = Number(req.body.trainingWeeks);
  const weightRecommandation = req.body.weightPlaceholders as WeightRecommendationBase;
  const coverImage = req.body.coverImage;

  const trainingWeeksArr = createNewTrainingPlanWithPlaceholders(trainingWeeks, trainingFrequency);

  const newTrainingPlan: TrainingPlan = {
    id: uuidv4(),
    title,
    trainingFrequency,
    weightRecommandationBase: weightRecommandation,
    lastUpdated: new Date(),
    trainingWeeks: trainingWeeksArr,
    coverImageBase64: coverImage
  };

  user.trainingPlans.push(newTrainingPlan);
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

  res.status(200).json({ trainingPlanEditView });
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

  trainingPlan.title = req.body.title;
  trainingPlan.trainingFrequency = Number(req.body.trainingFrequency);
  trainingPlan.weightRecommandationBase = req.body.weightPlaceholders as WeightRecommendationBase;
  if (req.body.coverImage) {
    trainingPlan.coverImageBase64 = req.body.coverImage;
  }

  if (trainingPlan.trainingWeeks.length !== Number(req.body.trainingWeeks)) {
    const difference = trainingPlan.trainingWeeks.length - parseInt(req.body.trainingWeeks);
    handleWeekDifference(trainingPlan, difference);
  }

  await userDAO.update(user);
  res.status(200).json({ message: 'Trainingsplan erfolgreich aktualisiert' });
}
