import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';

/**
 * Overhead press exercise category with default settings.
 */
const Overheadpress: UserExerciseCategory = {
  name: 'Overheadpress',
  pauseTime: 150,
  defaultSets: 3,
  defaultReps: 10,
  defaultRPE: 8.5,
};

/**
 * List of overhead press exercises.
 */
const overheadpressExercises: UserExercise[] = [
  {
    name: 'Overheadpress',
    category: Overheadpress,
  },
  {
    name: 'Push-Press',
    category: Overheadpress,
  },
  {
    name: 'Dumbell Overheadpress',
    category: Overheadpress,
  },
  {
    name: 'Shoulderpress',
    category: Overheadpress,
  },
];

export default overheadpressExercises;
