import { Exercise } from '@shared/models/exercise/exercise';
import { ExerciseCategory } from '@shared/models/exercise/exerciseCategory.js';

/**
 * Back exercise category with default settings.
 */
const Back: ExerciseCategory = {
  name: 'Back',
  pauseTime: 120,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of back exercises.
 */
const backExercises: Exercise[] = [
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
