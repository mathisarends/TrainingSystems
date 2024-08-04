import { UserExerciseCategory } from '../../models/collections/user/user-exercise-category.js';
import { UserExercise } from '../../models/collections/user/user-exercise.js';

/**
 * Tricep exercise category with default settings.
 */
const Triceps: UserExerciseCategory = {
  name: 'Triceps',
  pauseTime: 90,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of tricep exercises.
 */
const tricepExercises: UserExercise[] = [
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
