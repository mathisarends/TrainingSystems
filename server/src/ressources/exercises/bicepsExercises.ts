import { ExerciseCategory } from '../../models/exercise/exerciseCategory.js';
import { Exercise } from '../../models/exercise/exercise.js';

/**
 * Biceps exercise category with default settings.
 */
const Biceps: ExerciseCategory = {
  name: 'Biceps',
  pauseTime: 90,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of biceps exercises.
 */
const bicepsExercises: Exercise[] = [
  {
    name: 'Biceps-Curls',
    category: Biceps
  },
  {
    name: 'Cable Curls',
    category: Biceps
  },
  {
    name: 'Hammer Curls',
    category: Biceps
  }
];

export default bicepsExercises;
