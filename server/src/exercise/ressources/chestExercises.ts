import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';

/**
 * Chest exercise category with default settings.
 */
const Chest: UserExerciseCategory = {
  name: 'Chest',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5,
};

/**
 * List of chest exercises.
 */
const chestExercises: UserExercise[] = [
  {
    name: 'Dips',
    category: Chest,
  },
  {
    name: 'Butterfly',
    category: Chest,
  },
  {
    name: 'Deficit Pushups',
    category: Chest,
  },
];

export default chestExercises;
