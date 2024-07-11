import { ExerciseCategory } from '../../models/exercise/exerciseCategory.js';

/**
 * Overhead press exercise category with default settings.
 */
const Overheadpress: ExerciseCategory = {
  name: 'Overheadpress',
  pauseTime: 150,
  defaultSets: 3,
  defaultReps: 10,
  defaultRPE: 8.5
};

/**
 * List of overhead press exercises.
 */
const overheadpressExercises = [
  {
    name: 'Overheadpress',
    category: Overheadpress
  },
  {
    name: 'Push-Press',
    category: Overheadpress
  },
  {
    name: 'Dumbell Overheadpress',
    category: Overheadpress
  },
  {
    name: 'Shoulderpress',
    category: Overheadpress
  }
];

export default overheadpressExercises;
