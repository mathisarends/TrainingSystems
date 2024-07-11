import { ExerciseCategory } from '../../models/exercise/exerciseCategory.js';
import { Exercise } from '../../models/exercise/exercise.js';

/**
 * Chest exercise category with default settings.
 */
const Chest: ExerciseCategory = {
  name: 'Chest',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of chest exercises.
 */
const chestExercises: Exercise[] = [
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
