import { UserExerciseCategory } from '../../models/collections/user/user-exercise-category.js';
import { UserExercise } from '../../models/collections/user/user-exercise.js';

/**
 * Back exercise category with default settings.
 */
const Back: UserExerciseCategory = {
  name: 'Back',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of back exercises.
 */
const backExercises: UserExercise[] = [
  {
    name: 'Pull-Up',
    category: Back
  },
  {
    name: 'Dumbell Row',
    category: Back
  },
  {
    name: 'Pulldowns (wide-grip)',
    category: Back
  },
  {
    name: 'Pulldowns (close-grip)',
    category: Back
  },
  {
    name: 'T-Bar Row',
    category: Back
  },
  {
    name: 'Chestsupported Row',
    category: Back
  }
];

export default backExercises;
