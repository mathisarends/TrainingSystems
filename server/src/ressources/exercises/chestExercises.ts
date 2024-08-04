import { UserExerciseCategory } from '../../models/collections/user/user-exercise-category.js';
import { UserExercise } from '../../models/collections/user/user-exercise.js';

/**
 * Chest exercise category with default settings.
 */
const Chest: UserExerciseCategory = {
  name: 'Chest',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of chest exercises.
 */
const chestExercises: UserExercise[] = [
  {
    name: 'Dips',
    category: Chest
  },
  {
    name: 'Butterfly',
    category: Chest
  },
  {
    name: 'Deficit Pushups',
    category: Chest
  }
];

export default chestExercises;
