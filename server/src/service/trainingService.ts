import { Exercise } from '../models/training/exercise.js';
import { TrainingDay } from '../models/training/trainingDay.js';
import { TrainingPlan } from '../models/training/trainingPlan.js';
import { TrainingWeek } from '../models/training/trainingWeek.js';

import { v4 as uuidv4 } from 'uuid';

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

  const roundedPercentage = roundToNearestStep(percentageFinished, 2.5);

  return roundedPercentage;
}

/**
 * Rundet eine Zahl auf den nächsten Schritt.
 * @param value Die zu rundende Zahl.
 * @param step Die Schrittgröße, auf die gerundet werden soll.
 * @returns Die gerundete Zahl.
 */
function roundToNearestStep(value: number, step: number): number {
  return Math.round(value / step) * step;
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

export function createNewTrainingPlanBasedOnTemplate(trainingPlan: TrainingPlan): TrainingWeek[] {
  for (const trainingWeek of trainingPlan.trainingWeeks) {
    for (const trainingDay of trainingWeek.trainingDays) {
      for (const exercise of trainingDay.exercises) {
        exercise.weight = '';
        exercise.actualRPE = '';
        exercise.estMax = 0;
        exercise.notes = '';
      }
    }
  }

  return trainingPlan.trainingWeeks;
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

export function getMostRecentTrainingPlanOfUser(trainnigPlans: TrainingPlan[]): TrainingPlan | null {
  if (trainnigPlans.length === 0) {
    return null;
  }

  return trainnigPlans.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())[0];
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
    targetRPE: '',
    actualRPE: '',
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
      exercise.targetRPE = fieldValue;
      break;
    case fieldName.endsWith('actualRPE'):
      exercise.actualRPE = fieldValue;
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

/**
 * Calculates the total tonnage (weight lifted) for a given training day.
 *
 * @param trainingDay - A TrainingDay object containing the exercises for that day.
 * @returns The total tonnage for the training day.
 */
export function getTonnagePerTrainingDay(trainingDay: TrainingDay): number {
  let tonnage = 0;

  for (const exercise of trainingDay.exercises) {
    const weight = parseWeight(exercise.weight);

    const tonnagePerExercise = weight * exercise.sets * exercise.reps;
    tonnage += tonnagePerExercise;
  }

  return tonnage;
}

/**
 * Parses a weight value which is always a string. The string could be a single number,
 * a semicolon-delimited string of numbers, or an invalid string.
 *
 * @param weightInput - The weight value as a string.
 * @returns The parsed number, or the average of the numbers if multiple weights are provided, or 0 if invalid.
 */
function parseWeight(weightInput: string): number {
  const parsedWeight = Number(weightInput);
  if (!isNaN(parsedWeight)) {
    return parsedWeight;
  }

  const weights = weightInput.split(';').map(Number);
  const validWeights = weights.filter(weight => !isNaN(weight));

  if (validWeights.length === 0) {
    return 0;
  }

  const sum = validWeights.reduce((total, weight) => total + weight, 0);
  return sum / validWeights.length;
}
