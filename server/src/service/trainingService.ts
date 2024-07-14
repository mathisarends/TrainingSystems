import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { TrainingPlan } from '@shared/models/training/trainingPlan.js';
import { TrainingWeek } from '@shared/models/training/trainingWeek.js';
import { User } from '@shared/models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { TrainingPlanDTO } from '../dto/trainingDto.js';
import { BasicTrainingPlanView } from '@shared/models/dtos/training/trainingDto.types.js';
import { UserClaimsSet } from './exerciseService.js';
import { WeightRecommendationBase } from '@shared/models/training/enum/weightRecommandationBase.js';

export async function getTrainingPlans(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet
): Promise<BasicTrainingPlanView[]> {
  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }
  return getAllPlansBasic(user.trainingPlans);
}

export async function createTrainingPlan(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  planDetails: Record<string, string>
): Promise<BasicTrainingPlanView[]> {
  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const title = planDetails.title;
  const trainingFrequency = Number(planDetails.trainingFrequency);
  const trainingWeeks = Number(planDetails.trainingWeeks);
  const weightRecommandation = planDetails.weightPlaceholders as WeightRecommendationBase;

  const trainingWeeksArr = createNewTrainingPlanWithPlaceholders(trainingWeeks, trainingFrequency);

  const newTrainingPlan: TrainingPlan = {
    id: uuidv4(),
    title,
    trainingFrequency,
    weightRecommandationBase: weightRecommandation,
    lastUpdated: new Date(),
    trainingWeeks: trainingWeeksArr
  };

  user.trainingPlans.push(newTrainingPlan);
  await userDAO.update(user);

  return getAllPlansBasic(user.trainingPlans);
}

export async function deleteTrainingPlan(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  planId: string
): Promise<void> {
  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, planId);
  if (trainingPlanIndex === -1) {
    throw new Error('Ungültige Trainingsplan-ID');
  }

  user.trainingPlans.splice(trainingPlanIndex, 1);
  await userDAO.update(user);
}

export async function getTrainingPlanForEdit(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  trainingPlanId: string
): Promise<BasicTrainingPlanView> {
  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
  if (trainingPlanIndex === -1) {
    throw new Error('Ungültige Trainingsplan-ID');
  }

  const trainingPlan = user.trainingPlans[trainingPlanIndex];
  const fields: Array<keyof TrainingPlan> = [
    'id',
    'title',
    'trainingFrequency',
    'weightRecommandationBase',
    'trainingWeeks'
  ];

  return TrainingPlanDTO.getCustomView(trainingPlan, fields);
}

export async function updateTrainingPlan(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  trainingPlanId: string,
  planDetails: Record<string, string>
): Promise<void> {
  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
  if (trainingPlanIndex === -1) {
    throw new Error('Ungültige Trainingsplan-ID');
  }

  const trainingPlan = user.trainingPlans[trainingPlanIndex];
  trainingPlan.title = planDetails.title;
  trainingPlan.trainingFrequency = Number(planDetails.trainingFrequency);
  trainingPlan.weightRecommandationBase = planDetails.weightPlaceholders as WeightRecommendationBase;

  if (trainingPlan.trainingWeeks.length !== Number(planDetails.trainingWeeks)) {
    const difference = trainingPlan.trainingWeeks.length - parseInt(planDetails.trainingWeeks);
    handleWeekDifference(trainingPlan, difference);
  }

  await userDAO.update(user);
}

export async function getTrainingPlanForDay(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  trainingPlanId: string,
  trainingWeekIndex: number,
  trainingDayIndex: number
) {
  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const trainingPlanIndex = findTrainingPlanIndexById(user.trainingPlans, trainingPlanId);
  if (trainingPlanIndex === -1) {
    throw new Error('Ungültige Trainingsplan-ID');
  }

  const trainingPlan = user.trainingPlans[trainingPlanIndex];
  if (trainingWeekIndex > trainingPlan.trainingWeeks.length) {
    throw new Error('Die angefragte Woche gibt es nicht im Trainingsplan bitte erhöhe die Blocklänge');
  }

  const trainingWeek = trainingPlan.trainingWeeks[trainingWeekIndex];
  if (trainingDayIndex > trainingWeek.trainingDays.length) {
    throw new Error('Der angefragte Tag ist zu hoch für die angegebene Trainingsfrequenz');
  }

  const trainingDay = trainingWeek.trainingDays[trainingDayIndex];

  return {
    title: trainingPlan.title,
    trainingFrequency: trainingPlan.trainingFrequency,
    trainingBlockLengtH: trainingPlan.trainingWeeks.length,
    trainingDay
  };
}

export function findTrainingPlanIndexById(trainingPlans: TrainingPlan[], planId: string): number {
  return trainingPlans.findIndex(plan => plan.id === planId);
}

function getAllPlansBasic(trainingPlans: TrainingPlan[]): BasicTrainingPlanView[] {
  return trainingPlans.map(plan => TrainingPlanDTO.getBasicView(plan));
}

function createNewTrainingPlanWithPlaceholders(weeks: number, daysPerWeek: number): TrainingWeek[] {
  return Array.from({ length: weeks }, () => ({
    trainingDays: Array.from({ length: daysPerWeek }, () => ({ exercises: [] }))
  }));
}

function handleWeekDifference(trainingPlan: TrainingPlan, difference: number) {
  const absoluteDifference = Math.abs(difference);
  if (difference < 0) {
    addNewTrainingWeeks(trainingPlan.trainingWeeks, trainingPlan.trainingFrequency, absoluteDifference);
  } else {
    removeTrainingWeeks(trainingPlan.trainingWeeks, absoluteDifference);
  }
}

function addNewTrainingWeeks(trainingWeeks: TrainingWeek[], trainingFrequency: number, addedWeeks: number) {
  for (let j = 0; j < addedWeeks; j++) {
    trainingWeeks.push({
      trainingDays: Array.from({ length: trainingFrequency }, () => ({ exercises: [] }))
    });
  }
}

export function removeTrainingWeeks(trainingWeeks: TrainingWeek[], removeTrainingWeeks: number) {
  trainingWeeks.splice(-removeTrainingWeeks, removeTrainingWeeks);
}
