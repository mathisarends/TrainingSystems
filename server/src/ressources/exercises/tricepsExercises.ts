import { Exercise } from '@shared/models/exercise/exercise';
import { ExerciseCategory } from '@shared/models/exercise/exerciseCategory.js';

/**
 * Tricep exercise category with default settings.
 */
const Triceps: ExerciseCategory = {
  name: 'Triceps',
  pauseTime: 90,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of tricep exercises.
 */
const tricepExercises: Exercise[] = [
  {
    name: 'Triceps-Extensions',
    category: Triceps
  },
  {
    name: 'French-Press Flat',
    category: Triceps
  },
  {
    name: 'Cable-Pushdowns',
    category: Triceps
  },
  {
    name: 'Diamond Pushups',
    category: Triceps
  }
];

export default tricepExercises;
