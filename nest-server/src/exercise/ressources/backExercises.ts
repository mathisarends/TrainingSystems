import { UserExercise } from '../model/user-exercise.model';
import { UserExerciseCategory } from '../types/user-exercise-category';

/**
 * Back exercise category with default settings.
 */
const Back: UserExerciseCategory = {
  name: 'Back',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5,
};

/**
 * List of back exercises.
 */
const backExercises: UserExercise[] = [
  {
    name: 'Pull-Up',
    category: Back,
  },
  {
    name: 'Dumbell Row',
    category: Back,
  },
  {
    name: 'Pulldowns (wide-grip)',
    category: Back,
  },
  {
    name: 'Pulldowns (close-grip)',
    category: Back,
  },
  {
    name: 'T-Bar Row',
    category: Back,
  },
  {
    name: 'Chestsupported Row',
    category: Back,
  },
];

export default backExercises;
