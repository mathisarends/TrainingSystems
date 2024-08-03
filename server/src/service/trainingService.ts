import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { TrainingPlan } from '@shared/models/training/trainingPlan.js';
import { TrainingWeek } from '@shared/models/training/trainingWeek.js';
import { User } from '@shared/models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { TrainingPlanDTO } from '../dto/trainingDto.js';
import { BasicTrainingPlanView, TrainingPlanCardView } from '@shared/models/dtos/training/trainingDto.types.js';
import { UserClaimsSet } from './exerciseService.js';
import { WeightRecommendationBase } from '@shared/models/training/enum/weightRecommandationBase.js';
import { Exercise } from '@shared/models/training/exercise.js';
import { TrainingDay } from '@shared/models/training/trainingDay.js';

export async function getTrainingPlans(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet
): Promise<TrainingPlanCardView[]> {
  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }
  return getAllPlansBasic(user.trainingPlans, user.pictureUrl);
}

export async function createTrainingPlan(
  userDAO: MongoGenericDAO<User>,
  userClaimsSet: UserClaimsSet,
  planDetails: Record<string, string>
): Promise<TrainingPlanCardView[]> {
  const user: User | null = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const title = planDetails.title;
  const trainingFrequency = Number(planDetails.trainingFrequency);
  const trainingWeeks = Number(planDetails.trainingWeeks);
  const weightRecommandation = planDetails.weightPlaceholders as WeightRecommendationBase;
  const coverImage = planDetails.coverImage;

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
    'trainingWeeks',
    'coverImageBase64'
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
  if (planDetails.coverImage) {
    trainingPlan.coverImageBase64 = planDetails.coverImage;
  }

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
    trainingBlockLength: trainingPlan.trainingWeeks.length,
    trainingDay
  };
}

export function findTrainingPlanIndexById(trainingPlans: TrainingPlan[], planId: string): number {
  return trainingPlans.findIndex(plan => plan.id === planId);
}

function getAllPlansBasic(trainingPlans: TrainingPlan[], pictureUrl?: string): TrainingPlanCardView[] {
  return trainingPlans.map(plan => ({
    ...TrainingPlanDTO.getBasicView(plan),
    pictureUrl
  }));
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

// Function to find the latest training day with weight entry
export function findLatestTrainingDayWithWeight(trainingPlan: TrainingPlan) {
  for (let wIndex = trainingPlan.trainingWeeks.length - 1; wIndex >= 0; wIndex--) {
    const trainingWeek = trainingPlan.trainingWeeks[wIndex];
    for (let dIndex = trainingWeek.trainingDays.length - 1; dIndex >= 0; dIndex--) {
      const trainingDay = trainingWeek.trainingDays[dIndex];

      if (trainingDay.exercises?.some(exercise => exercise.weight)) {
        if (dIndex + 1 < trainingWeek.trainingDays.length) {
          const nextDay = trainingWeek.trainingDays[dIndex + 1];
          if (!nextDay.exercises?.some(exercise => exercise.weight)) {
            return { weekIndex: wIndex, dayIndex: dIndex };
          }
        } else if (wIndex + 1 < trainingPlan.trainingWeeks.length) {
          const nextWeek = trainingPlan.trainingWeeks[wIndex + 1];
          if (
            nextWeek.trainingDays.length > 0 &&
            !nextWeek.trainingDays[0].exercises?.some(exercise => exercise.weight)
          ) {
            return { weekIndex: wIndex, dayIndex: dIndex };
          }
        } else {
          return { weekIndex: wIndex, dayIndex: dIndex };
        }
      }
    }
  }
  return { weekIndex: 0, dayIndex: 0 };
}

/**
 * Creates a new Exercise object.
 * @param fieldName - The name of the field being updated.
 * @param fieldValue - The value to be assigned to the field.
 * @returns A complete Exercise object with default values.
 */
export function createExerciseObject(fieldName: string, fieldValue: string): Exercise | null {
  return {
    category: fieldName.endsWith('category') ? fieldValue : '',
    exercise: '',
    sets: 0,
    reps: 0,
    weight: '',
    targetRPE: 0,
    actualRPE: 0,
    estMax: 0
  };
}

export function updateExercise(
  fieldName: string,
  fieldValue: string,
  exercise: Exercise,
  trainingDay: TrainingDay,
  exerciseIndex: number,
  copyMode = false
) {
  // zum löschen nachdem sie gelöscht wurde wird sie aber wieder neue erstellt!!! also funktioniert noch nicht
  if (fieldName.endsWith('category') && (fieldValue === '- Bitte Auswählen -' || fieldValue === '')) {
    trainingDay.exercises.splice(exerciseIndex - 1, 1);
    return;
  }

  if (copyMode && (fieldName.endsWith('actualRPE') || fieldName.endsWith('weight') || fieldName.endsWith('estMax'))) {
    return;
  }

  switch (true) {
    case fieldName.endsWith('category'):
      exercise.category = fieldValue;
      break;
    case fieldName.endsWith('exercise_name'):
      exercise.exercise = fieldValue;
      break;
    case fieldName.endsWith('sets'):
      exercise.sets = Number(fieldValue);
      break;
    case fieldName.endsWith('reps'):
      exercise.reps = Number(fieldValue);
      break;
    case fieldName.endsWith('weight'):
      exercise.weight = fieldValue;
      break;
    case fieldName.endsWith('targetRPE'):
      exercise.targetRPE = Number(fieldValue);
      break;
    case fieldName.endsWith('actualRPE'):
      exercise.actualRPE = Number(fieldValue);
      break;
    case fieldName.endsWith('estMax'):
      exercise.estMax = Number(fieldValue);
      break;
    default:
      console.log('Dieses Feld gibt es leider nicht!');
      break;
  }
}
