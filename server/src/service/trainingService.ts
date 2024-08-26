import { TrainingPlan } from '../models/training/trainingPlan.js';
import { TrainingWeek } from '../models/training/trainingWeek.js';
import { Exercise } from '../models/training/exercise.js';
import { TrainingDay } from '../models/training/trainingDay.js';

import { v4 as uuidv4 } from 'uuid';
import { TrainingDayIndexes } from './training-day-indexes.js';

export function findTrainingPlanById(trainingPlans: TrainingPlan[], planId: string): TrainingPlan {
  const plan = trainingPlans.find(plan => plan.id === planId);

  if (!plan) {
    throw new Error(`Training plan with ID ${planId} not found.`);
  }
  return plan;
}

export function getNextTrainingDay(trainingPlan: TrainingPlan): TrainingDayIndexes {
  let { weekIndex, dayIndex } = findLatestTrainingDayWithWeight(trainingPlan);

  if (dayIndex < trainingPlan.trainingFrequency - 1) {
    dayIndex += 1;
  } else if (weekIndex < trainingPlan.trainingWeeks.length - 1) {
    weekIndex += 1;
    dayIndex = 0;
  } else {
    // last day
    weekIndex = 0;
    dayIndex = 0;
  }

  return { weekIndex, dayIndex };
}

export function getAverageTrainingDuration(trainingPlan: TrainingPlan): string | undefined {
  const trainingDurations: number[] = [];

  // Collect all training durations from the plan
  for (const trainingWeek of trainingPlan.trainingWeeks) {
    for (const trainingDay of trainingWeek.trainingDays) {
      if (trainingDay.durationInMinutes) {
        trainingDurations.push(trainingDay.durationInMinutes);
      }
    }
  }

  // If no training durations were found, return undefined
  if (trainingDurations.length === 0) {
    return undefined;
  }

  // Calculate the sum of all training durations
  const totalDuration = trainingDurations.reduce((sum, duration) => sum + duration, 0);

  const averageTrainingDuration = totalDuration / trainingDurations.length;

  const hours = Math.floor(averageTrainingDuration / 60);
  const minutes = Math.round(averageTrainingDuration % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes} Minuten`;
  }
}

export function getPercentageOfTrainingPlanFinished(trainingPlan: TrainingPlan) {
  const trainingFrequency = trainingPlan.trainingFrequency;

  const totalAmountOfTrainingDays = trainingFrequency * trainingPlan.trainingWeeks.length;

  const { weekIndex, dayIndex } = findLatestTrainingDayWithWeight(trainingPlan);

  let amountOfTrainingDaysFinished;
  if (isFirstTrainingDay(weekIndex, dayIndex)) {
    amountOfTrainingDaysFinished = 0;
  } else {
    amountOfTrainingDaysFinished = weekIndex * trainingFrequency + dayIndex;
  }

  const percentageFinished = (amountOfTrainingDaysFinished / totalAmountOfTrainingDays) * 100;

  return percentageFinished;
}

function isFirstTrainingDay(weekIndex: number, dayIndex: number) {
  return weekIndex === 0 && dayIndex === 0;
}

export function findTrainingPlanIndexById(trainingPlans: TrainingPlan[], planId: string): number {
  const index = trainingPlans.findIndex(plan => plan.id === planId);

  if (index === -1) {
    throw new Error(`Training plan with ID ${planId} not found.`);
  }

  return index;
}

export function createNewTrainingPlanWithPlaceholders(weeks: number, daysPerWeek: number): TrainingWeek[] {
  return Array.from({ length: weeks }, () => ({
    trainingDays: Array.from({ length: daysPerWeek }, () => ({ id: uuidv4(), exercises: [] }))
  }));
}

export function handleWeekDifference(trainingPlan: TrainingPlan, difference: number) {
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
      trainingDays: Array.from({ length: trainingFrequency }, () => ({ id: uuidv4(), exercises: [] }))
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

      if (trainingDay.exercises?.some((exercise: Exercise) => exercise.weight)) {
        if (dIndex + 1 < trainingWeek.trainingDays.length) {
          const nextDay = trainingWeek.trainingDays[dIndex + 1];
          if (!nextDay.exercises?.some((exercise: Exercise) => exercise.weight)) {
            return { weekIndex: wIndex, dayIndex: dIndex };
          }
        } else if (wIndex + 1 < trainingPlan.trainingWeeks.length) {
          const nextWeek = trainingPlan.trainingWeeks[wIndex + 1];
          if (
            nextWeek.trainingDays.length > 0 &&
            !nextWeek.trainingDays[0].exercises?.some((exercise: Exercise) => exercise.weight)
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
    case fieldName.endsWith('notes'):
      exercise.notes = fieldValue;
      break;
    default:
      console.log('Dieses Feld gibt es leider nicht!');
      break;
  }
}
