import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';

/**
 * Biceps exercise category with default settings.
 */
const Biceps: UserExerciseCategory = {
  name: 'Biceps',
  pauseTime: 90,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5,
};

/**
 * List of biceps exercises.
 */
const bicepsExercises: UserExercise[] = [
  {
    name: 'Biceps-Curls',
    category: Biceps,
  },
  {
    name: 'Cable Curls',
    category: Biceps,
  },
  {
    name: 'Hammer Curls',
    category: Biceps,
  },
];

export default bicepsExercises;
