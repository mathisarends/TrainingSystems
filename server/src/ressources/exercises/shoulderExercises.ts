import { Exercise } from '@shared/models/exercise/exercise';
import { ExerciseCategory } from '@shared/models/exercise/exerciseCategory.js';

/**
 * Shoulder exercise category with default settings.
 */
const Shoulder: ExerciseCategory = {
  name: 'Shoulder',
  pauseTime: 90,
  defaultSets: 3,
  defaultReps: 12,
  defaultRPE: 8.5
};

/**
 * List of shoulder exercises.
 */
const shoulderExercises: Exercise[] = [
  {
    name: 'Reverse Flyes',
    category: Shoulder
  },
  {
    name: 'Lateral Raise',
    category: Shoulder
  },
  {
    name: 'Facepulls',
    category: Shoulder
  },
  {
    name: 'Upright Rows',
    category: Shoulder
  },
  {
    name: 'Front-Raises',
    category: Shoulder
  }
];

export default shoulderExercises;
